export const dynamic = "force-dynamic"
import { db, installTimes } from "@/lib/db"

export default async function InstallTimesPage() {
  const times = await db.select().from(installTimes)
  const categories = [...new Set(times.map(t => t.category))]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Installation Times</h1>
        <p className="text-gray-500 text-sm mt-1">Reference hours by machine type and configuration</p>
      </div>

      <div className="space-y-4">
        {categories.map(cat => {
          const catTimes = times.filter(t => t.category === cat)
          return (
            <div key={cat} className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h2 className="font-semibold text-gray-900">{cat}</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Machine Type</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Description</th>
                    <th className="text-right px-5 py-2 text-xs font-medium text-gray-500">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {catTimes.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2 font-medium">{t.machineType}</td>
                      <td className="px-3 py-2 text-gray-500">{t.description}</td>
                      <td className="px-5 py-2 text-right font-mono font-medium text-blue-700">{t.hours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
