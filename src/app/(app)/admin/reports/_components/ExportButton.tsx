"use client";

interface ExportButtonProps {
  data: unknown[];
  filename: string;
  label?: string;
}

export function ExportButton({
  data,
  filename,
  label = "Export CSV",
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Convert JSON to CSV
    const headers = Object.keys(data[0] as object).join(",");
    const rows = data.map((row) =>
      Object.values(row as object)
        .map((value) => `"${value}"`)
        .join(","),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

    // Download file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="flex items-center gap-2 rounded-xl border border-[#D7CCC8] bg-white px-4 py-2 font-bold text-[#5D4037] shadow-sm transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {label}
    </button>
  );
}
