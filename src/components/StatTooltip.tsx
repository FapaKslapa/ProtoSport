export default function CustomTooltip({active, payload, label, euro}: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background: "#fff",
            border: `1.5px solid #ef4444`,
            borderRadius: 12,
            boxShadow: "0 2px 8px #ef444422",
            padding: 12,
            minWidth: 90
        }}>
            <div style={{fontWeight: 700, color: "#ef4444", marginBottom: 4}}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{color: "#111", fontWeight: 500}}>
                    {p.name}: <span style={{fontWeight: 700}}>{euro ? p.value.toLocaleString("it-IT", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0
                }) : p.value}</span>
                </div>
            ))}
        </div>
    );
}