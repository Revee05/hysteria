"use client";

export default function TableAdmin({
  columns = [],
  data = [],
  loading = false,
  emptyText = "Tidak ada data",
}) {
  ////////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////////

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading data...
      </div>
    );
  }

  ////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////

  return (
    <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          {/* HEADER */}
          <thead className="border-b border-gray-300 text-black font-semibold bg-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-6 ${
                    col.align === "center" ? "text-center" : "text-left"
                  }`}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="hover:bg-gray-50 transition"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-4 px-6 ${
                        col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {col.render
                        ? col.render(row)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}