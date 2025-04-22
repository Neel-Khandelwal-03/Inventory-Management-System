document.addEventListener('DOMContentLoaded', () => {
    fetch('/inventory')
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById('inventoryList');
        const alerts = document.getElementById('alerts');
        list.innerHTML = '';
        alerts.innerHTML = '';
  
        data.items.forEach(item => {
          const li = document.createElement('li');
          li.textContent = `${item.name} — Qty: ${item.quantity} | ${item.category} | $${item.price}`;
          list.appendChild(li);
        });
  
        data.alerts.forEach(alert => {
          const p = document.createElement('p');
          p.textContent = alert;
          alerts.appendChild(p);
        });
      });
  });
  