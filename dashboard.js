document.addEventListener("DOMContentLoaded", () => {
  const warehouseForm = document.getElementById("addWarehouseForm");
  const warehouseList = document.getElementById("warehouseList");
  const storeForm = document.getElementById("addStoreForm");
  const storeList = document.getElementById("storeList");
  const productForm = document.getElementById("addProductForm");
  const transferForm = document.getElementById("transferProductForm");

  const navLinks = document.querySelectorAll('.nav-link');
const allSections = document.querySelectorAll('.main section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);

    allSections.forEach(section => section.classList.remove('active'));

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add('active');

      
    }
  });
});

  // Load warehouses on page load
  async function loadWarehouses() {
    try {
      const response = await fetch('/api/warehouses');
      const warehouses = await response.json();

      if (!warehouseList) return;
      warehouseList.innerHTML = "";

      const heading = document.createElement("h3");
      heading.textContent = "Warehouse List";
      warehouseList.appendChild(heading);

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.marginTop = "10px";
      table.style.color = "#fff";
      table.style.backgroundColor = "#1f1f1f";

      const headerRow = document.createElement("tr");
      ["Warehouse ID", "Location", "Capacity"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        th.style.padding = "10px";
        th.style.border = "1px solid #444";
        th.style.backgroundColor = "#2a2a2a";
        th.style.textAlign = "left";
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      warehouses.forEach(w => {
        const row = document.createElement("tr");
        [w.Warehouse_ID, w.Location, w.Capacity].forEach(data => {
          const td = document.createElement("td");
          td.textContent = data;
          td.style.padding = "10px";
          td.style.border = "1px solid #444";
          row.appendChild(td);
        });
        table.appendChild(row);
      });

      warehouseList.appendChild(table);
    } catch (err) {
      console.error("Failed to load warehouses:", err);
    }
  }

  // Load stores on page load
  async function loadStores() {
    try {
      const response = await fetch('/api/stores');
      const stores = await response.json();

      if (!storeList) return;
      storeList.innerHTML = "";

      const heading = document.createElement("h3");
      heading.textContent = "Store List";
      storeList.appendChild(heading);

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.marginTop = "10px";
      table.style.color = "#fff";
      table.style.backgroundColor = "#1f1f1f";

      const headerRow = document.createElement("tr");
      ["Store No", "Store Name", "Location", "Owner Name"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        th.style.padding = "10px";
        th.style.border = "1px solid #444";
        th.style.backgroundColor = "#2a2a2a";
        th.style.textAlign = "left";
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      stores.forEach(s => {
        const row = document.createElement("tr");
        [s.Store_No, s.Store_Name, s.Location, s.Owner_Name].forEach(data => {
          const td = document.createElement("td");
          td.textContent = data;
          td.style.padding = "10px";
          td.style.border = "1px solid #444";
          row.appendChild(td);
        });
        table.appendChild(row);
      });

      storeList.appendChild(table);
    } catch (err) {
      console.error("Failed to load stores:", err);
    }
  }

  loadWarehouses();
  loadStores();

  // Warehouse form submission
  if (warehouseForm) {
    warehouseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(warehouseForm));
      try {
        const response = await fetch("/add-warehouse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to add warehouse");
        alert("Warehouse added successfully!");
        warehouseForm.reset();
        loadWarehouses();
      } catch (err) {
        alert("Error adding warehouse: " + err.message);
      }
    });
  }

  // Store form submission
  if (storeForm) {
    storeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(storeForm));
      try {
        const response = await fetch("/add-store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to add store");
        alert("Store added successfully!");
        storeForm.reset();
        loadStores();
      } catch (err) {
        alert("Error adding store: " + err.message);
      }
    });
  }

  // Product form submission
  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(productForm).entries());

      try {
        const response = await fetch("/add-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const msg = await response.text();
        alert(msg);
        productForm.reset();
        loadProducts();
      }

      catch (err) {
        console.error(err);
        alert("Failed to add product: " + err.message);
      }
    });
  }

  // Product transfer
  if (transferForm) {
    transferForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(transferForm).entries());

      try {
        const response = await fetch("/transfer-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const msg = await response.text();
        alert(msg);
        transferForm.reset();
      } catch (err) {
        console.error(err);
        alert("Product transfer failed: " + err.message);
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('/logout', { method: 'POST' })
        .then(response => {
          if (response.redirected) {
            window.location.href = response.url;
          }
        });
    });
  }

  // Toggle dropdown visibility
  const inventoryToggle = document.getElementById("inventory-toggle");
  const inventorySubmenu = document.getElementById("inventory-submenu");

  if (inventoryToggle && inventorySubmenu) {
    inventoryToggle.addEventListener("click", () => {
      inventorySubmenu.style.display = inventorySubmenu.style.display === "none" ? "block" : "none";
    });
  }

  // Load warehouse inventory into existing section
  const warehouseInventoryBtn = document.getElementById("warehouse-inventory");
  if (warehouseInventoryBtn) {
    warehouseInventoryBtn.addEventListener("click", async () => {
      const sections = document.querySelectorAll(".main section");
      sections.forEach(section => section.classList.remove("active"));

      const inventorySection = document.getElementById("inventory-section");
      inventorySection.classList.add("active");

      try {
        const res = await fetch("/warehouse-inventory-data");
        const data = await res.json();

        const container = document.getElementById("warehouseInventoryList");
        container.innerHTML = "";

        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.innerHTML = `
          <thead>
            <tr>
              <th style="border: 1px solid #444;">Product ID</th>
              <th style="border: 1px solid #444;">Product Name</th>
              <th style="border: 1px solid #444;">Category</th>
              <th style="border: 1px solid #444;">Price</th>
              <th style="border: 1px solid #444;">Warehouse ID</th>
              <th style="border: 1px solid #444;">Quantity</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;

        data.forEach(row => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="border: 1px solid #444;">${row.Product_ID}</td>
            <td style="border: 1px solid #444;">${row.Name}</td>
            <td style="border: 1px solid #444;">${row.Category}</td>
            <td style="border: 1px solid #444;">${row.Price}</td>
            <td style="border: 1px solid #444;">${row.Warehouse_ID}</td>
            <td style="border: 1px solid #444;">${row.Quantity}</td>
          `;
          table.querySelector("tbody").appendChild(tr);
        });

        container.appendChild(table);
      } catch (err) {
        console.error("Failed to load warehouse inventory:", err);
      }
    });
  }




  const storeInventoryBtn = document.getElementById("store-inventory");
if (storeInventoryBtn) {
  storeInventoryBtn.addEventListener("click", async () => {
    const sections = document.querySelectorAll(".main section");
    sections.forEach(section => section.classList.remove("active"));

    const storeInventorySection = document.getElementById("store-inventory-section");
    storeInventorySection.classList.add("active");

    try {
      const res = await fetch("/store-inventory-data");
      const data = await res.json();

      const container = document.getElementById("storeInventoryList");
      container.innerHTML = "";

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.innerHTML = `
        <thead>
          <tr>
            <th style="border: 1px solid #444;">Product ID</th>
            <th style="border: 1px solid #444;">Product Name</th>
            <th style="border: 1px solid #444;">Category</th>
            <th style="border: 1px solid #444;">Price</th>
            <th style="border: 1px solid #444;">Store No</th>
            <th style="border: 1px solid #444;">Quantity</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="border: 1px solid #444;">${row.Product_ID}</td>
          <td style="border: 1px solid #444;">${row.Name}</td>
          <td style="border: 1px solid #444;">${row.Category}</td>
          <td style="border: 1px solid #444;">${row.Price}</td>
          <td style="border: 1px solid #444;">${row.Store_No}</td>
          <td style="border: 1px solid #444;">${row.Quantity}</td>
        `;
        table.querySelector("tbody").appendChild(tr);
      });

      container.appendChild(table);
    } catch (err) {
      console.error("Failed to load store inventory:", err);
    }
  });
}

// Load products and display in a styled table
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();

    const productTable = document.getElementById("productTableBody");
    if (!productTable) return;

    productTable.innerHTML = "";

    products.forEach(p => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="padding:10px; border:1px solid #444;">${p.Product_ID}</td>
        <td style="padding:10px; border:1px solid #444;">${p.Name}</td>
        <td style="padding:10px; border:1px solid #444;">${p.Price}</td>
        <td style="padding:10px; border:1px solid #444;">${p.Quantity}</td>
        <td style="padding:10px; border:1px solid #444;">${p.Category}</td>
        <td style="padding:10px; border:1px solid #444;">${p.Supplier_ID}</td>
      `;
      productTable.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load products:", err);
  }
}

loadProducts();

});
