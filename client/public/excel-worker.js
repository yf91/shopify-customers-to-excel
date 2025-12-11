// Excel Worker für asynchrone Verarbeitung
/* global XLSX, self */
importScripts(
  "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"
);

self.onmessage = async function (event) {
  try {
    const { type, data } = event.data;
    if (type === "EXPORT_CUSTOMERS") {
      const { customers, country, split } = data;
      const customerData = [];

      if (split) {
        const customersByCountry = {};
        customers.forEach((customer) => {
          const country = customer.defaultAddress?.country || "NoCountry";
          if (!customersByCountry[country]) {
            customersByCountry[country] = [];
          }
          customersByCountry[country].push(customer);
        });
        Object.keys(customersByCountry).forEach((country) => {
          // Excel-Datei erstellen mit allen Kundenattributen
          const dataToWrite = [
            [
              "Email",
              "First Name",
              "Last Name",
              "Created At",
              "Phone",
              "Verified Email",
              "Valid Email Address",
              "Number of Orders",
              "Amount Spent",
              "Currency Code",
              "Address",
              "City",
              "Country",
            ],
            ...customersByCountry[country].map((customer) => [
              customer.email,
              customer.firstName,
              customer.lastName,
              customer.createdAt,
              customer.phone,
              customer.verifiedEmail,
              customer.validEmailAddress,
              customer.numberOfOrders,
              customer.amountSpent.amount,
              customer.amountSpent.currencyCode,
              customer.defaultAddress?.address1 || "",
              customer.defaultAddress?.city || "",
              customer.defaultAddress?.country || "",
            ]),
          ];

          const worksheet = XLSX.utils.aoa_to_sheet(dataToWrite);
          worksheet["!cols"] = [
            { wch: 30 }, // Email
            { wch: 15 }, // First Name
            { wch: 15 }, // Last Name
            { wch: 20 }, // Created At
            { wch: 15 }, // Phone
            { wch: 15 }, // Verified Email
            { wch: 18 }, // Valid Email Address
            { wch: 18 }, // Number of Orders
            { wch: 15 }, // Amount Spent
            { wch: 15 }, // Currency Code
            { wch: 15 }, // Address
            { wch: 15 }, // City
            { wch: 15 }, // Country
          ];

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

          // Excel als Binary String exportieren
          const wbout = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "binary",
            compression: true,
          });

          // Binary String zu Array Buffer konvertieren
          const buf = new ArrayBuffer(wbout.length);
          const view = new Uint8Array(buf);
          for (let i = 0; i < wbout.length; i++) {
            view[i] = wbout.charCodeAt(i) & 0xff;
          }

          customerData.push({
            country: country,
            count: customersByCountry[country].length,
            buffer: buf,
          });
        });
      } else {
        // Excel-Datei erstellen mit allen Kundenattributen
        const dataToWrite = [
          [
            "Email",
            "First Name",
            "Last Name",
            "Created At",
            "Phone",
            "Verified Email",
            "Valid Email Address",
            "Number of Orders",
            "Amount Spent",
            "Currency Code",
            "Address",
            "City",
            "Country",
          ],
          ...customers.map((customer) => [
            customer.email,
            customer.firstName,
            customer.lastName,
            customer.createdAt,
            customer.phone,
            customer.verifiedEmail,
            customer.validEmailAddress,
            customer.numberOfOrders,
            customer.amountSpent.amount,
            customer.amountSpent.currencyCode,
            customer.defaultAddress?.address1 || "",
            customer.defaultAddress?.city || "",
            customer.defaultAddress?.country || "",
          ]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(dataToWrite);
        worksheet["!cols"] = [
          { wch: 30 }, // Email
          { wch: 15 }, // First Name
          { wch: 15 }, // Last Name
          { wch: 20 }, // Created At
          { wch: 15 }, // Phone
          { wch: 15 }, // Verified Email
          { wch: 18 }, // Valid Email Address
          { wch: 18 }, // Number of Orders
          { wch: 15 }, // Amount Spent
          { wch: 15 }, // Currency Code
          { wch: 15 }, // Address
          { wch: 15 }, // City
          { wch: 15 }, // Country
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

        // Excel als Binary String exportieren
        const wbout = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "binary",
          compression: true,
        });

        // Binary String zu Array Buffer konvertieren
        const buf = new ArrayBuffer(wbout.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < wbout.length; i++) {
          view[i] = wbout.charCodeAt(i) & 0xff;
        }

        customerData.push({
          country: country,
          count: customers.length,
          buffer: buf,
        });
      }

      // Ergebnis senden
      self.postMessage({
        status: "SUCCESS",
        data: customerData,
      });
    }
  } catch (error) {
    self.postMessage({
      status: "ERROR",
      error: error.message,
    });
  }
};
