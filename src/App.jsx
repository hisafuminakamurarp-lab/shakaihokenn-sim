import { useState, useEffect } from "react";

const KENPO_RATES = {
  "北海道":5.14,"青森":4.925,"岩手":4.755,"宮城":5.05,"秋田":5.005,
  "山形":4.875,"福島":4.75,"茨城":4.76,"栃木":4.91,"群馬":4.84,
  "埼玉":4.835,"千葉":4.865,"東京":4.925,"神奈川":4.96,"新潟":4.605,
  "富山":4.795,"石川":4.85,"福井":4.855,"山梨":4.775,"長野":4.815,
  "岐阜":4.90,"静岡":4.805,"愛知":4.965,"三重":4.885,"滋賀":4.94,
  "京都":4.945,"大阪":5.065,"兵庫":5.06,"奈良":4.955,"和歌山":5.03,
  "鳥取":4.93,"島根":4.97,"岡山":5.025,"広島":4.89,"山口":5.075,
  "徳島":5.12,"香川":5.01,"愛媛":4.99,"高知":5.025,"福岡":5.055,
  "佐賀":5.275,"長崎":5.03,"熊本":5.04,"大分":5.04,"宮崎":4.885,
  "鹿児島":5.065,"沖縄":4.72
};
const KAIGO_RATE = 0.81;
const KOYO_RATES = { "一般":0.5, "農林水産・清酒製造":0.6, "建設":0.6 };
const KENPO_GRADES = [
  58000,68000,78000,88000,98000,104000,110000,118000,126000,134000,
  142000,150000,160000,170000,180000,190000,200000,220000,240000,260000,
  280000,300000,320000,340000,360000,380000,410000,440000,470000,500000,
  530000,560000,590000,620000,650000,680000,710000,750000,790000,830000,
  880000,930000,980000,1030000,1090000,1150000,1210000,1270000,1330000,1390000
];
const NENKIN_GRADES = [
  88000,98000,104000,110000,118000,126000,134000,142000,150000,160000,
  170000,180000,190000,200000,220000,240000,260000,280000,300000,320000,
  340000,360000,380000,410000,440000,470000,500000,530000,560000,590000,620000
];
const PREFS = Object.keys(KENPO_RATES);
const getStd = (a, g) => { for (const x of g) if (a <= x) return x; return g[g.length-1]; };
const fmt = n => Math.round(n).toLocaleString();

function calcWithholding(taxable, dep) {
  if (taxable <= 0) return 0;
  const B = taxable * 12;
  let C;
  if (B<=1625000) C=550000;
  else if (B<=1800000) C=B*0.4-100000;
  else if (B<=3600000) C=B*0.3+80000;
  else if (B<=6600000) C=B*0.2+440000;
  else if (B<=8500000) C=B*0.1+1100000;
  else C=1950000;
  const D = Math.floor((B-C)/1000)*1000;
  const Gv = Math.max(Math.floor((D-480000-dep*380000)/1000)*1000, 0);
  let H;
  if (Gv<=1950000) H=Gv*0.05;
  else if (Gv<=3300000) H=Gv*0.10-97500;
  else if (Gv<=6950000) H=Gv*0.20-427500;
  else if (Gv<=9000000) H=Gv*0.23-636000;
  else if (Gv<=18000000) H=Gv*0.33-1536000;
  else if (Gv<=40000000) H=Gv*0.40-2796000;
  else H=Gv*0.45-4796000;
  return Math.max(Math.floor(Math.floor(H*1.021)/12), 0);
}

export default function App() {
  const [monthly, setMonthly] = useState("");
  const [commute, setCommute] = useState("");
  const [pref, setPref]   = useState("東京");
  const [age, setAge]     = useState("40歳未満");
  const [koyo, setKoyo]   = useState("一般");
  const [deps, setDeps]   = useState(0);
  const [jumin, setJumin] = useState("");
  const [isPC, setIsPC]   = useState(window.innerWidth >= 768);

  useEffect(() => {
    const fn = () => setIsPC(window.innerWidth >= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const m = parseInt(monthly)||0, c = parseInt(commute)||0, total = m+c;
  const kStd   = getStd(total, KENPO_GRADES);
  const nStd   = getStd(total, NENKIN_GRADES);
  const kenpo  = total>0 ? Math.floor(kStd*(KENPO_RATES[pref]||4.925)/100) : 0;
  const kaigo  = total>0 && age==="40〜64歳" ? Math.floor(kStd*KAIGO_RATE/100) : 0;
  const nenkin = total>0 ? Math.floor(nStd*9.15/100) : 0;
  const koyoH  = total>0 ? Math.floor(total*(KOYO_RATES[koyo]||0.5)/100) : 0;
  const soc    = kenpo+kaigo+nenkin+koyoH;
  const taxM   = Math.max(m-soc,0);
  const wh     = m>0 ? calcWithholding(taxM,deps) : 0;
  const jM     = parseInt(jumin)||0;
  const deduct = soc+wh+jM;
  const net    = Math.max(m-deduct,0);
  const rate   = m>0 ? Math.round(net/m*100) : 0;

  const CARD = {
    background:"#fff", borderRadius:16,
    padding: isPC ? "24px 28px" : "18px",
    boxShadow:"0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)",
  };
  const SEC = { fontSize:10, color:"#aaa", letterSpacing:"0.1em", fontWeight:700,
    textTransform:"uppercase", marginBottom:14 };

  const Row = ({ label, sub, val, bold, accent, green }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"9px 0", borderBottom:"1px solid #f0ede8" }}>
      <span style={{ fontSize:13, fontWeight:bold?700:400, color:bold?"#1a1a2e":"#555" }}>
        {label}
        {sub && <span style={{ fontSize:10, color:"#ccc", marginLeft:5 }}>{sub}</span>}
      </span>
      <span style={{ fontSize:bold?15:13, fontWeight:700, fontVariantNumeric:"tabular-nums",
        color: green?"#059669" : accent?"#7c3aed" : "#1a1a2e",
        transition:"all 0.15s" }}>
        ¥{fmt(val)}
      </span>
    </div>
  );

  // ── パーツ ──────────────────────────────────────

  const FormCard = () => (
    <div style={CARD}>
      <div style={SEC}>給与情報を入力</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        <div><label>月給額（課税手当）</label>
          <input type="number" placeholder="300000" value={monthly} onChange={e=>setMonthly(e.target.value)}/></div>
        <div><label>交通費（非課税）</label>
          <input type="number" placeholder="20000" value={commute} onChange={e=>setCommute(e.target.value)}/></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
        <div><label>都道府県</label>
          <select value={pref} onChange={e=>setPref(e.target.value)}>
            {PREFS.map(p=><option key={p}>{p}</option>)}
          </select></div>
        <div><label>年齢</label>
          <select value={age} onChange={e=>setAge(e.target.value)}>
            <option>40歳未満</option><option>40〜64歳</option><option>65歳以上</option>
          </select></div>
        <div><label>雇用保険</label>
          <select value={koyo} onChange={e=>setKoyo(e.target.value)}>
            <option>一般</option><option>農林水産・清酒製造</option><option>建設</option>
          </select></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div><label>扶養人数</label>
          <select value={deps} onChange={e=>setDeps(Number(e.target.value))}>
            {[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}人</option>)}
          </select></div>
        <div><label>住民税（月額）</label>
          <input type="number" placeholder="15000" value={jumin} onChange={e=>setJumin(e.target.value)}/></div>
      </div>
      {total>0 && (
        <div style={{ marginTop:12, padding:"8px 12px", background:"#f8f7f4",
          borderRadius:8, fontSize:11, color:"#aaa", display:"flex", gap:16, flexWrap:"wrap" }}>
          <span>健保標準報酬 <strong style={{color:"#1a1a2e"}}>¥{fmt(kStd)}</strong></span>
          <span>厚年標準報酬 <strong style={{color:"#1a1a2e"}}>¥{fmt(nStd)}</strong></span>
        </div>
      )}
    </div>
  );

  const SocCard = () => (
    <div style={CARD}>
      <div style={SEC}>社会保険料</div>
      <Row label="健康保険料" sub={`${(KENPO_RATES[pref]||4.925).toFixed(3)}%`} val={kenpo}/>
      {age==="40〜64歳" && <Row label="介護保険料" sub="0.81%" val={kaigo}/>}
      <Row label="厚生年金保険料" sub="9.15%" val={nenkin}/>
      <Row label="雇用保険料" sub={`${KOYO_RATES[koyo]}%`} val={koyoH}/>
      <Row label="社会保険料 計" val={soc} bold accent/>
    </div>
  );

  const TaxCard = () => (
    <div style={CARD}>
      <div style={SEC}>税金・控除</div>
      <Row label="課税対象額" sub="月給-社保" val={taxM} green/>
      <Row label="源泉所得税" sub={`扶養${deps}人`} val={wh}/>
      <Row label="住民税" val={jM}/>
      <Row label="控除合計" val={deduct} bold accent/>
    </div>
  );

  const NetCard = () => (
    <div style={{ background:"#1a1a2e", borderRadius:16,
      padding: isPC ? "28px 32px" : "20px",
      boxShadow:"0 4px 24px rgba(26,26,46,0.2)" }}>
      <div style={{ fontSize:10, color:"#555", letterSpacing:"0.12em", fontWeight:700, marginBottom:8 }}>
        差引支給額（手取り）
      </div>
      <div style={{ fontFamily:"'DM Serif Display',serif",
        fontSize: isPC ? 56 : 42, fontWeight:400, color:"#fff",
        letterSpacing:"-0.02em", transition:"all 0.15s", marginBottom:16 }}>
        ¥{fmt(net)}
      </div>
      <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:6, height:6,
        overflow:"hidden", marginBottom:16 }}>
        <div style={{ height:"100%", borderRadius:6,
          background:"linear-gradient(90deg,#60a5fa,#a78bfa)",
          width:`${rate}%`, transition:"width 0.4s ease" }}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, textAlign:"center" }}>
        {[
          { label:"手取り率",   val:`${rate}%`,         color:"#fff" },
          { label:"控除合計",   val:`¥${fmt(deduct)}`,  color:"#c084fc" },
          { label:"年間手取り", val:`¥${fmt(net*12)}`,  color:"#60a5fa" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:10,
            padding: isPC ? "12px 8px" : "10px 6px" }}>
            <div style={{ fontSize: isPC?11:9, color:"#555", marginBottom:3 }}>{label}</div>
            <div style={{ fontSize: isPC?15:12, fontWeight:700, color, transition:"all 0.15s" }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const Live = () => (
    <div style={{ display:"flex", alignItems:"center", gap:6,
      marginBottom: isPC ? 14 : 10, marginTop: isPC ? 0 : 0 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e",
        boxShadow:"0 0 6px #22c55e", display:"inline-block" }}/>
      <span style={{ fontSize:10, color:"#22c55e", fontWeight:700, letterSpacing:"0.1em" }}>LIVE</span>
    </div>
  );

  const Note = () => (
    <p style={{ fontSize:10, color:"#ccc", textAlign:"center",
      marginTop: isPC ? 28 : 14, lineHeight:1.8 }}>
      ※概算です。標準報酬月額の改定・保険組合により異なります<br/>
      令和8年度 協会けんぽ料率使用
    </p>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f8f7f4",
      fontFamily:"'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif",
      color:"#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,select{
          background:#fff;border:1.5px solid #e2e0da;color:#1a1a2e;
          border-radius:10px;padding:10px 14px;font-size:14px;width:100%;
          outline:none;transition:all 0.2s;font-family:inherit;
          appearance:none;-webkit-appearance:none;
        }
        input:focus,select:focus{border-color:#1a1a2e;box-shadow:0 0 0 3px rgba(26,26,46,0.08);}
        label{font-size:11px;color:#999;margin-bottom:5px;display:block;
          font-weight:500;letter-spacing:0.06em;text-transform:uppercase;}
      `}</style>

      {/* ヘッダー */}
      <div style={{ background:"#1a1a2e", color:"#fff",
        padding: isPC ? "36px 48px" : "24px 20px" }}>
        <div style={{ maxWidth: isPC ? 1140 : 480, margin:"0 auto",
          display:"flex", alignItems: isPC ? "flex-end" : "flex-start",
          justifyContent:"space-between",
          flexDirection: isPC ? "row" : "column", gap:8 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"0.2em", color:"#555", marginBottom:6 }}>
              SALARY CALCULATOR
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif",
              fontSize: isPC ? 40 : 26, fontWeight:400, lineHeight:1.2 }}>
              給与計算シミュレーター
            </h1>
          </div>
          <div style={{ fontSize:11, color:"#555", paddingBottom: isPC ? 5 : 0 }}>
            令和8年度（2026年）協会けんぽ対応
          </div>
        </div>
      </div>

      {/* ── PC: 左入力・右結果 ── */}
      {isPC ? (
        <div style={{ maxWidth:1140, margin:"0 auto", padding:"36px 48px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, alignItems:"start" }}>

            {/* 左：入力 */}
            <FormCard/>

            {/* 右：結果 */}
            <div>
              <Live/>
              {/* 社保・税金を横並び */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                <SocCard/>
                <TaxCard/>
              </div>
              <NetCard/>
            </div>
          </div>
          <Note/>
        </div>

      ) : (
        /* ── モバイル: 縦積み ── */
        <div style={{ maxWidth:480, margin:"0 auto", padding:"18px 16px" }}>
          <FormCard/>
          <div style={{ height:14 }}/>
          <Live/>
          <SocCard/>
          <div style={{ height:12 }}/>
          <TaxCard/>
          <div style={{ height:12 }}/>
          <NetCard/>
          <Note/>
        </div>
      )}
    </div>
  );
}
