"use client";

import XLSX from "xlsx-js-style";

interface ExportButtonProps {
  data: unknown[];
  filename: string;
  label?: string;
}

export function ExportButton({
  data,
  filename,
  label = "Export Excel",
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // 1. Create Worksheet from JSON
    const worksheet = XLSX.utils.json_to_sheet(data);

    // --- Styling Logic ---
    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      // A. Calculate column widths (Auto-fit columns)
      const keys = Object.keys(data[0]);

      const columnWidths = keys.map((key) => {
        let maxLength = key.length;

        // Loop through data to find max length
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.forEach((row: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          const val = row[key];
          const cellValue = val ? String(val) : "";
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length;
          }
        });

        // Add buffer
        return { wch: maxLength + 5 };
      });

      // Set column widths
      worksheet["!cols"] = columnWidths;

      // B. Add styles (Colors, Borders)
      // Get the range of the sheet to iterate correctly
      const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1");

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const cell = worksheet[cellAddress];

          // Skip if cell doesn't exist
          if (!cell) continue;

          // Check if it's a Header (Row 0)
          const isHeader = R === 0;

          if (isHeader) {
            // Header Style
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            cell.s = {
              font: {
                name: "Calibri",
                sz: 12,
                bold: true,
                color: { rgb: "FFFFFF" }, // White text
              },
              fill: {
                fgColor: { rgb: "4F81BD" }, // Blue background
              },
              alignment: {
                vertical: "center",
                horizontal: "center",
              },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
              },
            };
          } else {
            // Body Style
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            cell.s = {
              font: {
                name: "Calibri",
                sz: 11,
              },
              alignment: {
                vertical: "center",
                horizontal: "left",
              },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
              },
            };
          }
        }
      }
    }
    // --- End Styling ---

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
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
