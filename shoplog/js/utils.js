// ═══════════════════════════════════════
// FONEKINGDOM SHOPLOG — Shared Utilities
// ═══════════════════════════════════════

// ─── Number helpers ───────────────────────
export function num(v) { return parseFloat(v) || 0; }
export function fmt(v) { return Math.round(v).toLocaleString('en-PH'); }

// ─── Date helpers ─────────────────────────
export function today() {
  // Returns YYYY-MM-DD in LOCAL time (not UTC)
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth()+1).padStart(2,'0'),
    String(d.getDate()).padStart(2,'0')
  ].join('-');
}

export function dateOf(r) {
  // Get YYYY-MM-DD from a repair or attendance record
  const v = r.date;
  if (!v) return '';
  if (typeof v === 'string') return v.slice(0,10);
  if (v.toDate) return v.toDate().toLocaleDateString('en-CA');
  if (v instanceof Date) return v.toLocaleDateString('en-CA');
  return '';
}

export function fmtTime(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-PH', { hour:'numeric', minute:'2-digit', hour12:true });
}

export function dateLabel(d) {
  if (!d) return '';
  const t  = today();
  const yd = new Date(); yd.setDate(yd.getDate()-1);
  const ys = yd.toLocaleDateString('en-CA');
  if (d === t)  return 'Ngayon';
  if (d === ys) return 'Kahapon';
  return new Date(d+'T00:00:00').toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' });
}

export function monthLabel(d) {
  return new Date(d+'T00:00:00').toLocaleDateString('en-PH', { month:'long', year:'numeric' });
}

// ─── DOM helper ───────────────────────────
export function g(id) { return document.getElementById(id); }

// ─── Toast notification ───────────────────
let _tTimer;
export function toast(msg, duration = 3200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_tTimer);
  _tTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// ─── Loading overlay ──────────────────────
export function load(on) {
  const el = document.getElementById('ldr');
  if (el) el.classList.toggle('on', !!on);
}

// ─── Commission math ──────────────────────
export function profit(r) {
  return Math.max(0, num(r.totalCharged) - num(r.partsCost) - num(r.otherExpenses));
}

// Per-repair commission (no daily bonus here)
export function repairComm(r) {
  const p = profit(r);
  const t = r.technician;
  if (t === 'Lester') return p * 0.40;
  if (t === 'Eder')   return p * 0.20;
  if (t === 'Owner')  return p * 0.60;
  return 0;
}

// Full stats for a pool of repairs
export function calcStats(pool) {
  const B = {
    Lester: { count:0, charged:0, profitSum:0, commBase:0, shopGross:0 },
    Eder:   { count:0, charged:0, profitSum:0, commBase:0, shopGross:0 },
    Owner:  { count:0, charged:0, profitSum:0, commBase:0, shopGross:0 },
  };

  pool.forEach(r => {
    const t = r.technician || 'Unknown';
    if (!B[t]) B[t] = { count:0, charged:0, profitSum:0, commBase:0, shopGross:0 };
    const p = profit(r);
    B[t].count++;
    B[t].charged  += num(r.totalCharged);
    B[t].profitSum += p;
    if (t==='Lester') { B[t].commBase+=p*0.40; B[t].shopGross+=p*0.60; }
    else if (t==='Eder')  { B[t].commBase+=p*0.20; B[t].shopGross+=p*0.80; }
    else if (t==='Owner') { B[t].commBase+=p*0.60; B[t].shopGross+=p*0.40; }
  });

  // Eder daily bonus — ₱200 per unique day worked (comes out of shop gross)
  const ederReps   = pool.filter(r=>r.technician==='Eder');
  const ederDays   = new Set(ederReps.map(r=>dateOf(r))).size;
  const ederBonus  = ederDays * 200;

  const lesterTotal  = B.Lester.commBase;
  const ederTotal    = B.Eder.commBase + ederBonus;
  const ownerPersonal= B.Owner.commBase;

  const lesterShop   = B.Lester.shopGross;
  const ederShop     = B.Eder.shopGross - ederBonus;   // shop pays the daily bonus
  const ownerShop    = B.Owner.shopGross;

  const shopTotal    = lesterShop + ederShop + ownerShop;
  const ownerGrand   = ownerPersonal + shopTotal;

  const totalCharged = pool.reduce((s,r)=>s+num(r.totalCharged),0);
  const totalProfit  = pool.reduce((s,r)=>s+profit(r),0);
  const pending      = pool.filter(r=>r.paymentStatus==='pending').reduce((s,r)=>s+num(r.totalCharged),0);

  return {
    totalCharged, totalProfit, pending,
    shopTotal, ownerGrand, ownerPersonal,
    lesterTotal, ederTotal, ederBonus, ederDays,
    lesterShop, ederShop, ownerShop,
    byTech: B
  };
}
