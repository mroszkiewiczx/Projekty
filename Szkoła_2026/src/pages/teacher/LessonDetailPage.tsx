import { useParams } from 'react-router-dom'

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Szczegóły lekcji</h1>
      <p className="text-gray-500 mt-2">ID: {id}</p>
    </div>
  )
}
