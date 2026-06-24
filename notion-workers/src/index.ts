import { Worker } from "@notionhq/workers";
import * as Builder from "@notionhq/workers/builder";
import { j } from "@notionhq/workers/schema-builder";
import type { Client } from "@notionhq/client";
import type {
	PageObjectResponse,
	DataSourceObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const worker = new Worker();
export default worker;

// --- Konfiguracja ---

const MASTER_DB = process.env.MASTER_DB_ID ?? "79a2d96a-4848-4814-9328-8a18556548c3";
const TRANSAKCJE_DB = process.env.TRANSAKCJE_DB_ID ?? "b3f3b51b-c353-44d8-9004-b78140016ccc";
const NOTATKI_DB = process.env.NOTATKI_DB_ID ?? "1deab197-15d4-4f96-b39a-0664b72add52";

// --- Typy ---

interface MasterRecord {
	nazwa: string;
	typ: string;
	email: string;
	telefon: string;
	linkedin: string;
	adres: string;
	miasto: string;
	nip: string;
	branza: string;
	website: string;
	osoba: string;
	stanowisko: string;
	zrodlo: string;
	notatka: string;
}

interface DealRecord {
	nazwa: string;
	firma: string;
	wartosc: number;
	etap: string;
	produkt: string;
	opis: string;
	masterPageId: string;
}

interface ActivityRecord {
	typ: string;
	tresc: string;
	wynik: string;
	firma: string;
	masterPageId: string;
	dealPageId?: string;
}

type PageProps = PageObjectResponse["properties"];
type Prop = PageProps[string];

// --- Pomocnicze odczyty właściwości ---

function getRichText(prop: Prop | undefined): string {
	if (!prop) return "";
	if (prop.type === "rich_text") return prop.rich_text.map((r) => r.plain_text).join("");
	if (prop.type === "title") return prop.title.map((r) => r.plain_text).join("");
	return "";
}

function getSelect(prop: Prop | undefined): string {
	if (!prop) return "";
	if (prop.type === "select") return prop.select?.name ?? "";
	if (prop.type === "status") return prop.status?.name ?? "";
	return "";
}

function getNumber(prop: Prop | undefined): number {
	if (!prop) return 0;
	if (prop.type === "number" && typeof prop.number === "number") return prop.number;
	return 0;
}

function getUrl(prop: Prop | undefined): string {
	if (!prop) return "";
	if (prop.type === "url" && prop.url) return prop.url;
	return "";
}

function getEmail(prop: Prop | undefined): string {
	if (!prop) return "";
	if (prop.type === "email" && prop.email) return prop.email;
	return "";
}

function getPhone(prop: Prop | undefined): string {
	if (!prop) return "";
	if (prop.type === "phone_number" && prop.phone_number) return prop.phone_number;
	return "";
}

function normalizeKey(name: string): string {
	return name
		.toLowerCase()
		.replace(/\s+(sp\.\s*z\s*o\.o\.?|s\.a\.?|sp\.k\.?|s\.c\.?)/gi, "")
		.replace(/[^a-z0-9ąćęłńóśźż]/gi, "")
		.trim();
}

// --- Paginacja wyników z dataSources.query ---

async function queryAllPages(notion: Client, dataSourceId: string): Promise<PageObjectResponse[]> {
	const pages: PageObjectResponse[] = [];
	let cursor: string | undefined;

	do {
		const response = await notion.dataSources.query({
			data_source_id: dataSourceId,
			start_cursor: cursor,
			page_size: 100,
			result_type: "page",
		});

		for (const result of response.results) {
			if (result.object === "page") {
				pages.push(result as PageObjectResponse);
			}
		}

		cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
	} while (cursor);

	return pages;
}

// --- Szukaj baz źródłowych ---

async function findSourceDatabases(notion: Client, excludeIds: string[]): Promise<string[]> {
	const keywords = [
		"Pipeline", "Deale", "AI Researcher", "Dziennik", "Aktywność",
		"Nagrania", "Transkrypcje", "Google Maps", "Leady", "Zadania CRM",
		"Firmy", "Klientów", "Kontakty",
	];

	const found = new Set<string>();
	const excludeSet = new Set(excludeIds);

	for (const keyword of keywords) {
		const results = await notion.search({
			query: keyword,
			filter: { value: "data_source", property: "object" },
			page_size: 10,
		});

		for (const db of results.results) {
			if (db.object === "data_source" && !excludeSet.has(db.id)) {
				found.add(db.id);
			}
		}
	}

	return Array.from(found);
}

// --- Załaduj istniejące rekordy MASTER ---

async function loadExistingMaster(notion: Client): Promise<Map<string, string>> {
	const map = new Map<string, string>();
	const pages = await queryAllPages(notion, MASTER_DB);
	for (const page of pages) {
		const nazwa = getRichText(page.properties["Nazwa"]);
		if (nazwa) map.set(normalizeKey(nazwa), page.id);
	}
	return map;
}

// --- Upsert firmy w MASTER ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildMasterProps(record: MasterRecord): Record<string, any> {
	return {
		Nazwa: Builder.title(record.nazwa),
		...(record.typ && { Typ: Builder.select(record.typ) }),
		...(record.email && { Email: { email: record.email } }),
		...(record.telefon && { Telefon: { phone_number: record.telefon } }),
		...(record.linkedin && { LinkedIn: { url: record.linkedin } }),
		...(record.adres && { Adres: Builder.richText(record.adres) }),
		...(record.miasto && { Miasto: Builder.richText(record.miasto) }),
		...(record.nip && { NIP: Builder.richText(record.nip) }),
		...(record.branza && { Branża: Builder.richText(record.branza) }),
		...(record.website && { Website: { url: record.website } }),
		...(record.osoba && { "Osoba kontaktowa": Builder.richText(record.osoba) }),
		...(record.stanowisko && { Stanowisko: Builder.richText(record.stanowisko) }),
		...(record.zrodlo && { Źródło: Builder.richText(record.zrodlo) }),
		...(record.notatka && {
			"Notatka ogólna": Builder.richText(record.notatka.slice(0, 2000)),
		}),
		"BANT — SDP?": Builder.select("Nie oceniono"),
	};
}

async function upsertMasterFirma(
	notion: Client,
	record: MasterRecord,
	existingMap: Map<string, string>
): Promise<string> {
	const key = normalizeKey(record.nazwa);
	const existingId = existingMap.get(key);

	if (existingId) {
		const existing = (await notion.pages.retrieve({
			page_id: existingId,
		})) as PageObjectResponse;
		const ep = existing.properties;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateProps: Record<string, any> = {};
		const allProps = buildMasterProps(record);

		for (const [k, val] of Object.entries(allProps)) {
			if (k === "Nazwa" || k === "BANT — SDP?") continue;
			const hasValue =
				getRichText(ep[k]) ||
				getSelect(ep[k]) ||
				getUrl(ep[k]) ||
				getEmail(ep[k]) ||
				getPhone(ep[k]);
			if (!hasValue) updateProps[k] = val;
		}

		if (Object.keys(updateProps).length > 0) {
			await notion.pages.update({ page_id: existingId, properties: updateProps });
		}
		return existingId;
	}

	const page = await notion.pages.create({
		parent: { database_id: MASTER_DB },
		properties: buildMasterProps(record),
	});
	existingMap.set(key, page.id);
	return page.id;
}

// --- Utwórz Transakcję ---

async function createTransakcja(notion: Client, deal: DealRecord): Promise<string> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const properties: Record<string, any> = {
		Nazwa: Builder.title(deal.nazwa || `Deal — ${deal.firma}`),
		Firma: { relation: [{ id: deal.masterPageId }] },
		...(deal.wartosc > 0 && { "Wartość PLN": { number: deal.wartosc } }),
		...(deal.etap && { Etap: Builder.select(deal.etap) }),
		...(deal.produkt && { Produkt: Builder.richText(deal.produkt) }),
		...(deal.opis && { Opis: Builder.richText(deal.opis.slice(0, 2000)) }),
	};

	const page = await notion.pages.create({
		parent: { database_id: TRANSAKCJE_DB },
		properties,
	});
	return page.id;
}

// --- Utwórz Notatkę ---

async function createNotatka(notion: Client, activity: ActivityRecord): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const properties: Record<string, any> = {
		Tytuł: Builder.title(`${activity.typ} — ${activity.firma}`),
		Firma: { relation: [{ id: activity.masterPageId }] },
		...(activity.typ && { Typ: Builder.select(activity.typ) }),
		...(activity.tresc && { Treść: Builder.richText(activity.tresc.slice(0, 2000)) }),
		...(activity.wynik && { Wynik: Builder.richText(activity.wynik) }),
		...(activity.dealPageId && {
			Transakcja: { relation: [{ id: activity.dealPageId }] },
		}),
	};

	await notion.pages.create({
		parent: { database_id: NOTATKI_DB },
		properties,
	});
}

// --- Mapowania stron źródłowych ---

function mapPageToMaster(page: PageObjectResponse, sourceName: string): MasterRecord | null {
	const p = page.properties;

	const nazwa =
		getRichText(p["Nazwa"]) ||
		getRichText(p["Name"]) ||
		getRichText(p["Firma"]) ||
		getRichText(p["Company"]) ||
		getRichText(p["Tytuł"]) ||
		Object.values(p)
			.filter((v): v is Prop & { type: "title" } => v.type === "title")
			.map((v) => getRichText(v))
			.find((v) => v.length > 0) ||
		"";

	if (!nazwa.trim()) return null;

	return {
		nazwa: nazwa.trim(),
		typ: getSelect(p["Typ"]) || getSelect(p["Type"]) || "Firma",
		email: getEmail(p["Email"]) || getRichText(p["Email"]) || getRichText(p["E-mail"]) || "",
		telefon:
			getPhone(p["Telefon"]) ||
			getPhone(p["Phone"]) ||
			getRichText(p["Telefon"]) ||
			getRichText(p["Tel"]) ||
			"",
		linkedin: getUrl(p["LinkedIn"]) || getRichText(p["LinkedIn"]) || "",
		adres: getRichText(p["Adres"]) || getRichText(p["Address"]) || "",
		miasto:
			getRichText(p["Miasto"]) ||
			getRichText(p["City"]) ||
			getRichText(p["Lokalizacja"]) ||
			"",
		nip: getRichText(p["NIP"]) || "",
		branza:
			getRichText(p["Branża"]) ||
			getSelect(p["Branża"]) ||
			getRichText(p["Industry"]) ||
			"",
		website:
			getUrl(p["Website"]) || getUrl(p["Strona"]) || getRichText(p["Strona WWW"]) || "",
		osoba:
			getRichText(p["Osoba kontaktowa"]) ||
			getRichText(p["Imię i nazwisko"]) ||
			getRichText(p["Contact"]) ||
			"",
		stanowisko:
			getRichText(p["Stanowisko"]) ||
			getRichText(p["Position"]) ||
			getRichText(p["Role"]) ||
			"",
		zrodlo: sourceName,
		notatka:
			getRichText(p["Notatka"]) ||
			getRichText(p["Notes"]) ||
			getRichText(p["Opis"]) ||
			"",
	};
}

function mapPageToDeal(
	page: PageObjectResponse,
	masterPageId: string,
	firmaNazwa: string
): DealRecord {
	const p = page.properties;
	return {
		nazwa:
			getRichText(p["Nazwa"]) ||
			getRichText(p["Name"]) ||
			getRichText(p["Deal"]) ||
			`Deal — ${firmaNazwa}`,
		firma: firmaNazwa,
		wartosc:
			getNumber(p["Wartość"]) ||
			getNumber(p["Value"]) ||
			getNumber(p["Kwota"]) ||
			getNumber(p["Amount"]) ||
			0,
		etap: getSelect(p["Etap"]) || getSelect(p["Stage"]) || getSelect(p["Status"]) || "",
		produkt:
			getRichText(p["Produkt"]) ||
			getSelect(p["Produkt"]) ||
			getRichText(p["Product"]) ||
			"",
		opis: getRichText(p["Opis"]) || getRichText(p["Description"]) || "",
		masterPageId,
	};
}

function mapPageToActivity(
	page: PageObjectResponse,
	masterPageId: string,
	firmaNazwa: string
): ActivityRecord {
	const p = page.properties;
	return {
		typ:
			getSelect(p["Typ"]) ||
			getSelect(p["Type"]) ||
			getSelect(p["Rodzaj"]) ||
			"Notatka",
		tresc:
			getRichText(p["Treść"]) ||
			getRichText(p["Content"]) ||
			getRichText(p["Opis"]) ||
			getRichText(p["Notatka"]) ||
			getRichText(p["Notes"]) ||
			"",
		wynik: getRichText(p["Wynik"]) || getRichText(p["Result"]) || "",
		firma: firmaNazwa,
		masterPageId,
	};
}

// --- TOOL: Importuj wszystkie firmy do MASTER ---

worker.tool("importMaster", {
	title: "Importuj firmy do MASTER",
	description:
		"Skanuje wszystkie bazy Notion, deduplikuje firmy i importuje je do MASTER — Firmy & Osoby. Tworzy powiązane Transakcje i Notatki.",
	schema: j.object({
		dryRun: j
			.boolean()
			.describe("Jeśli true — tylko zlicza rekordy bez zapisu (testowy)"),
	}),
	execute: async ({ dryRun }, { notion }) => {
		const log: string[] = [];

		const sourceIds = await findSourceDatabases(notion, [
			MASTER_DB,
			TRANSAKCJE_DB,
			NOTATKI_DB,
		]);
		log.push(`Znaleziono ${sourceIds.length} baz źródłowych`);

		if (dryRun) {
			for (const dbId of sourceIds) {
				try {
					const meta = (await notion.dataSources.retrieve({
						data_source_id: dbId,
					})) as DataSourceObjectResponse;
					const name = meta.title.map((t) => t.plain_text).join("") || dbId;
					const pages = await queryAllPages(notion, dbId);
					log.push(`  [DRY] ${name}: ${pages.length} rekordów`);
				} catch {
					log.push(`  [DRY] ${dbId}: brak dostępu`);
				}
			}
			return log.join("\n");
		}

		const existingMap = await loadExistingMaster(notion);
		let imported = 0;
		let deals = 0;
		let activities = 0;

		for (const dbId of sourceIds) {
			let sourceName = dbId;
			try {
				const meta = (await notion.dataSources.retrieve({
					data_source_id: dbId,
				})) as DataSourceObjectResponse;
				sourceName = meta.title.map((t) => t.plain_text).join("") || dbId;
			} catch {
				log.push(`Pominięto ${dbId} — brak dostępu`);
				continue;
			}

			const isDealDb = /pipeline|deal|sprzedaż/i.test(sourceName);
			const isActivityDb = /dziennik|aktywność|nagranie|transkrypcja/i.test(sourceName);

			let pages: PageObjectResponse[];
			try {
				pages = await queryAllPages(notion, dbId);
			} catch {
				log.push(`Pominięto ${sourceName} — błąd odczytu`);
				continue;
			}

			log.push(`[${sourceName}] ${pages.length} rekordów...`);

			for (const page of pages) {
				const master = mapPageToMaster(page, sourceName);
				if (!master) continue;

				const masterPageId = await upsertMasterFirma(notion, master, existingMap);
				imported++;

				if (isDealDb) {
					const deal = mapPageToDeal(page, masterPageId, master.nazwa);
					const dealId = await createTransakcja(notion, deal);
					deals++;
					await createNotatka(notion, {
						typ: "Transakcja",
						tresc: deal.opis || `${deal.etap} — ${deal.wartosc} PLN`,
						wynik: deal.etap,
						firma: master.nazwa,
						masterPageId,
						dealPageId: dealId,
					});
					activities++;
				} else if (isActivityDb) {
					const activity = mapPageToActivity(page, masterPageId, master.nazwa);
					if (activity.tresc) {
						await createNotatka(notion, activity);
						activities++;
					}
				}
			}
		}

		log.push(
			`\nGotowe! Zaimportowano: ${imported} firm, ${deals} transakcji, ${activities} notatek.`
		);
		return log.join("\n");
	},
});

// --- TOOL: Znajdź firmę w MASTER ---

worker.tool("znajdzFirme", {
	title: "Znajdź firmę w MASTER",
	description: "Wyszukuje firmę lub osobę w bazie MASTER po nazwie.",
	hints: { readOnlyHint: true },
	schema: j.object({
		nazwa: j.string().describe("Nazwa firmy lub osoby do wyszukania"),
	}),
	execute: async ({ nazwa }, { notion }) => {
		const results = await notion.dataSources.query({
			data_source_id: MASTER_DB,
			filter: { property: "Nazwa", title: { contains: nazwa } },
			result_type: "page",
			page_size: 10,
		});

		if (results.results.length === 0) return `Nie znaleziono: "${nazwa}"`;

		return results.results
			.filter((r): r is PageObjectResponse => r.object === "page")
			.map((p) => {
				const pr = p.properties;
				const name = getRichText(pr["Nazwa"]);
				const email = getEmail(pr["Email"]) || getRichText(pr["Email"]);
				const tel = getPhone(pr["Telefon"]) || getRichText(pr["Telefon"]);
				const bant = getSelect(pr["BANT — SDP?"]);
				const miasto = getRichText(pr["Miasto"]);
				const branza = getRichText(pr["Branża"]);
				return [
					`• ${name}`,
					email && `  Email: ${email}`,
					tel && `  Tel: ${tel}`,
					miasto && `  Miasto: ${miasto}`,
					branza && `  Branża: ${branza}`,
					bant && `  BANT SDP: ${bant}`,
				]
					.filter(Boolean)
					.join("\n");
			})
			.join("\n\n");
	},
});

// --- AUTOMATION: BANT — oceń potencjał SDP dla nowej firmy ---

worker.automation("ocenBANT", {
	title: "Oceń potencjał SDP (BANT)",
	description:
		"Gdy dodajesz nową firmę do MASTER, ocenia czy jest potencjalnym klientem ServiceDesk Plus i wypełnia pola BANT.",
	execute: async (event, { notion }) => {
		if (!event.pageId) return;

		const page = (await notion.pages.retrieve({
			page_id: event.pageId,
		})) as PageObjectResponse;
		const p = page.properties;

		const branza = getRichText(p["Branża"]) || getSelect(p["Branża"]);
		const typ = getSelect(p["Typ"]);

		// Logika oceny potencjału SDP (heurystyka)
		const isItFirm = /it|software|technolog|informatyk/i.test(branza);
		const isLargeFirm = /s\.a\.|sp\. z o\.o\.|grupp/i.test(getRichText(p["Nazwa"]));
		const isGovEdu = /szkoła|urząd|gmina|uczelnia|hospital|szpital/i.test(branza);

		let sdpScore = "Niski potencjał";
		let bantNeed = "Brak zidentyfikowanej potrzeby";

		if (isGovEdu) {
			sdpScore = "Wysoki potencjał";
			bantNeed =
				"Sektor publiczny/edukacja — częste wymagania ITSM, zarządzanie zgłoszeniami, inwentaryzacja IT";
		} else if (isItFirm) {
			sdpScore = "Wysoki potencjał";
			bantNeed = "Firma IT — potrzeba systemu ITSM do obsługi klientów lub wewnętrznego IT";
		} else if (isLargeFirm || typ === "Firma") {
			sdpScore = "Średni potencjał";
			bantNeed = "Duża firma — prawdopodobne potrzeby helpdesk i zarządzania zasobami IT";
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateProps: Record<string, any> = {
			"BANT — SDP?": Builder.select(sdpScore),
			"BANT — Potrzeba": Builder.richText(bantNeed),
		};

		await notion.pages.update({
			page_id: event.pageId,
			properties: updateProps,
		});
	},
});
