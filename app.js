/* ==========================================================================
   SANTANA ESTUDIO CONTABLE - JAVASCRIPT APP LOGIC
   Location: Mercedes, Corrientes, Argentina
   WhatsApp: +54 9 3773 474657
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initServiceTabs();
  initTaxCalendar();
  initMonotributoCalculator();
  initRegimeAdvisor();
  initContactForm();
  initModalExpress();
});

// Mobile Navigation Menu Toggle
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

// Services Tab Switching
function initServiceTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.services-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const paneToShow = document.getElementById(`tab-${targetTab}`);
      if (paneToShow) paneToShow.classList.add('active');
    });
  });
}

/* ==========================================================================
   TAX CALENDAR LOGIC (ARCA ex-AFIP & DGR CORRIENTES)
   Calculates due dates dynamically according to digit and selected month
   ========================================================================== */
function initTaxCalendar() {
  const cuitBtns = document.querySelectorAll('.cuit-btn');
  const monthSelect = document.getElementById('monthSelect');
  const organismSelect = document.getElementById('organismSelect');
  const calendarBody = document.getElementById('calendarTableBody');
  const cuitNotice = document.getElementById('currentCuitNotice');

  let selectedDigit = 0;

  cuitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cuitBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDigit = parseInt(btn.getAttribute('data-digit'));
      if (cuitNotice) cuitNotice.textContent = `Terminación CUIT: ${selectedDigit}`;
      renderCalendar();
    });
  });

  if (monthSelect) monthSelect.addEventListener('change', renderCalendar);
  if (organismSelect) organismSelect.addEventListener('change', renderCalendar);

  function getBaseDay(digit) {
    // Base day rules according to terminal digit (0-1: 18th, 2-3: 19th, 4-5: 20th, 6-7: 21st, 8-9: 22nd)
    if (digit === 0 || digit === 1) return 18;
    if (digit === 2 || digit === 3) return 19;
    if (digit === 4 || digit === 5) return 20;
    if (digit === 6 || digit === 7) return 21;
    return 22;
  }

  function renderCalendar() {
    if (!calendarBody) return;

    const monthVal = monthSelect ? parseInt(monthSelect.value) : new Date().getMonth() + 1;
    const yearVal = new Date().getFullYear();
    const organismFilter = organismSelect ? organismSelect.value : 'all';

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const baseDay = getBaseDay(selectedDigit);

    // List of obligations
    const obligations = [
      {
        organism: 'ARCA',
        badgeClass: 'badge-arca',
        name: 'Monotributo - Pago Mensual',
        period: `${monthNames[monthVal - 1]} ${yearVal}`,
        dueDay: 20, // Always 20th of the month
        desc: 'Vencimiento único de la cuota mensual unificada.'
      },
      {
        organism: 'ARCA',
        badgeClass: 'badge-arca',
        name: 'Impuesto al Valor Agregado (IVA)',
        period: `${monthNames[monthVal - 2 < 0 ? 11 : monthVal - 2]} ${yearVal}`,
        dueDay: baseDay,
        desc: 'Declaración jurada mensual e ingreso del saldo resultante.'
      },
      {
        organism: 'ARCA',
        badgeClass: 'badge-arca',
        name: 'Autónomos (Régimen General)',
        period: `${monthNames[monthVal - 1]} ${yearVal}`,
        dueDay: baseDay - 10 < 5 ? 5 + selectedDigit : baseDay - 10,
        desc: 'Aporte de trabajadores independientes registrados.'
      },
      {
        organism: 'ARCA',
        badgeClass: 'badge-arca',
        name: 'Empleadores (Formulario 931 / Sueldos)',
        period: `${monthNames[monthVal - 2 < 0 ? 11 : monthVal - 2]} ${yearVal}`,
        dueDay: 9 + Math.floor(selectedDigit / 2),
        desc: 'Presentación e integración de aportes y contribuciones patronales.'
      },
      {
        organism: 'DGR Corrientes',
        badgeClass: 'badge-dgr',
        name: 'Ingresos Brutos (DGR Corrientes - Régimen General)',
        period: `${monthNames[monthVal - 2 < 0 ? 11 : monthVal - 2]} ${yearVal}`,
        dueDay: baseDay + (selectedDigit % 2),
        desc: 'Declaración Jurada e Ingreso de Ingresos Brutos Provincial Corrientes.'
      },
      {
        organism: 'DGR Corrientes',
        badgeClass: 'badge-dgr',
        name: 'Convenio Multilateral (Siapere Corrientes)',
        period: `${monthNames[monthVal - 2 < 0 ? 11 : monthVal - 2]} ${yearVal}`,
        dueDay: 15 + Math.floor(selectedDigit / 2),
        desc: 'Liquidación mensual para contribuyentes con actividad en varias provincias.'
      }
    ];

    calendarBody.innerHTML = '';

    const filtered = obligations.filter(item => {
      if (organismFilter === 'all') return true;
      if (organismFilter === 'arca' && item.organism === 'ARCA') return true;
      if (organismFilter === 'dgr' && item.organism === 'DGR Corrientes') return true;
      return false;
    });

    filtered.forEach(item => {
      const tr = document.createElement('tr');

      // Adjust date string
      const formattedDate = `${String(item.dueDay).padStart(2, '0')}/${String(monthVal).padStart(2, '0')}/${yearVal}`;

      tr.innerHTML = `
        <td><span class="organismo-badge ${item.badgeClass}">${item.organism}</span></td>
        <td>
          <strong>${item.name}</strong>
          <br><small style="color: var(--text-muted);">${item.desc}</small>
        </td>
        <td>${item.period}</td>
        <td><span class="due-date-pill">${formattedDate}</span></td>
        <td>
          <a href="https://wa.me/5493773474657?text=Hola%20Santana%20Estudio%20Contable,%20necesito%20liquidar%20mi%20${encodeURIComponent(item.name)}%20(CUIT%20terminado%20en%20${selectedDigit})" target="_blank" class="link-official">
            Consultar por WhatsApp →
          </a>
        </td>
      `;
      calendarBody.appendChild(tr);
    });
  }

  // Initial render
  renderCalendar();
}

/* ==========================================================================
   MONOTRIBUTO CALCULATOR LOGIC (2026 AFIP Standard Parameters)
   ========================================================================== */
function initMonotributoCalculator() {
  const amountInput = document.getElementById('calcIncomeInput');
  const activitySelect = document.getElementById('calcActivitySelect');
  const calcBtn = document.getElementById('btnCalculateCategory');

  const categoryResult = document.getElementById('calcCategoryResult');
  const quotaResult = document.getElementById('calcQuotaResult');
  const descResult = document.getElementById('calcDescResult');

  // Categories reference table
  const categories = [
    { cat: 'A', limitServices: 6450000, limitGoods: 6450000, quota: 26600 },
    { cat: 'B', limitServices: 9450000, limitGoods: 9450000, quota: 30280 },
    { cat: 'C', limitServices: 13250000, limitGoods: 13250000, quota: 35400 },
    { cat: 'D', limitServices: 16450000, limitGoods: 16450000, quota: 45200 },
    { cat: 'E', limitServices: 19350000, limitGoods: 19350000, quota: 58100 },
    { cat: 'F', limitServices: 24250000, limitGoods: 24250000, quota: 69800 },
    { cat: 'G', limitServices: 29000000, limitGoods: 29000000, quota: 85200 },
    { cat: 'H', limitServices: 44000000, limitGoods: 44000000, quota: 170000 },
    { cat: 'I', limitServices: 44000000, limitGoods: 53250000, quota: 255000 },
    { cat: 'J', limitServices: 44000000, limitGoods: 61000000, quota: 310000 },
    { cat: 'K', limitServices: 44000000, limitGoods: 68000000, quota: 395000 }
  ];

  if (calcBtn) {
    calcBtn.addEventListener('click', calculateCategory);
  }

  if (amountInput) {
    amountInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') calculateCategory();
    });
  }

  function calculateCategory() {
    const rawVal = parseFloat(amountInput.value) || 0;
    const isMonthly = document.getElementById('calcPeriodType')?.value === 'monthly';
    const annualVal = isMonthly ? rawVal * 12 : rawVal;
    const activityType = activitySelect ? activitySelect.value : 'services';

    if (annualVal <= 0) {
      categoryResult.textContent = '-';
      quotaResult.textContent = '$0';
      descResult.textContent = 'Por favor ingresa un monto válido de facturación.';
      return;
    }

    let foundCat = null;

    for (let item of categories) {
      const limit = activityType === 'services' ? item.limitServices : item.limitGoods;
      if (annualVal <= limit) {
        foundCat = item;
        break;
      }
    }

    if (foundCat) {
      categoryResult.textContent = `Categoría ${foundCat.cat}`;
      quotaResult.textContent = `$${foundCat.quota.toLocaleString('es-AR')} /mes`;
      descResult.textContent = `Facturación anual estimada: $${annualVal.toLocaleString('es-AR')}. Apta para Monotributo unificado e Ingresos Brutos.`;
    } else {
      categoryResult.textContent = 'Excede Monotributo';
      quotaResult.textContent = 'Régimen General';
      descResult.textContent = `Tu facturación anual ($${annualVal.toLocaleString('es-AR')}) supera el tope máximo del Monotributo. Corresponde alta como Responsable Inscripto. ¡Consultanos para planificar tu transición!`;
    }
  }
}

/* ==========================================================================
   TAX REGIME ADVISOR SIMULATOR
   ========================================================================== */
function initRegimeAdvisor() {
  const advisorBtn = document.getElementById('btnRunAdvisor');
  const resBox = document.getElementById('advisorResultBox');
  const resTitle = document.getElementById('advisorResultTitle');
  const resDesc = document.getElementById('advisorResultDesc');

  if (advisorBtn) {
    advisorBtn.addEventListener('click', () => {
      const q1 = document.getElementById('advisorQ1')?.value;
      const q2 = document.getElementById('advisorQ2')?.value;
      const q3 = document.getElementById('advisorQ3')?.value;

      if (!resBox || !resTitle || !resDesc) return;

      if (q3 === 'sociedad') {
        resTitle.textContent = 'Sociedad Comercial (SAS / SRL / SA)';
        resDesc.textContent = 'Recomendado para proyectos con 2 o más socios, responsabilidad limitada y mayor estructura empresarial en Mercedes o Corrientes.';
      } else if (q1 === 'alta' || q2 === 'empresas') {
        resTitle.textContent = 'Responsable Inscripto (IVA + Ganancias)';
        resDesc.textContent = 'Ideal para comerciar con empresas responsables inscriptas que requieren crédito fiscal de IVA o si la facturación proyectada es elevada.';
      } else {
        resTitle.textContent = 'Monotributo Express (Alta en 24hs)';
        resDesc.textContent = 'La opción más simplificada, económica y rápida para comenzar a facturar legalmente con cuota fija mensual unificada.';
      }

      resBox.style.display = 'block';
    });
  }
}

/* ==========================================================================
   CONTACT FORM & WHATSAPP REDIRECTION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('santanaContactForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('formName').value;
      const phone = document.getElementById('formPhone').value;
      const service = document.getElementById('formServiceSelect').value;
      const message = document.getElementById('formMessage').value;

      const fullMessage = `Hola Santana Estudio Contable! 👋🏼%0A%0AMi nombre es: *${encodeURIComponent(name)}*%0ATeléfono: *${encodeURIComponent(phone)}*%0ATipo de Servicio: *${encodeURIComponent(service)}*%0A%0AConsulta: ${encodeURIComponent(message)}`;

      const wspUrl = `https://wa.me/5493773474657?text=${fullMessage}`;

      window.open(wspUrl, '_blank');
    });
  }
}

/* ==========================================================================
   MODAL EXPRESS MONOTRIBUTO 24 HS
   ========================================================================== */
function initModalExpress() {
  const openBtns = document.querySelectorAll('.trigger-express-modal');
  const modal = document.getElementById('expressModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const modalForm = document.getElementById('expressModalForm');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('active');
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('modalName').value;
      const cuit = document.getElementById('modalCuit').value;
      const actividad = document.getElementById('modalActivity').value;

      const msg = `Hola Santana Estudio Contable! Solicito el *Alta de Monotributo Express en 24 HS* 🚀%0A%0ANombre: *${encodeURIComponent(nombre)}*%0ACUIT/CUIL: *${encodeURIComponent(cuit)}*%0AActividad: *${encodeURIComponent(actividad)}*`;

      window.open(`https://wa.me/5493773474657?text=${msg}`, '_blank');
      modal.classList.remove('active');
    });
  }
}
