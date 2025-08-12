import React from "react";

function Row({label, value}:{label:string; value:any}){
  if(value==null || value==="") return null;
  const txt = Array.isArray(value) ? value.join(", ") : String(value);
  return (
    <div className="grid grid-cols-3 gap-2 py-1 text-sm">
      <div className="text-gray-600">{label}</div>
      <div className="col-span-2">{txt}</div>
    </div>
  );
}

export default function AnamnesisView({data}:{data:Record<string,any>}){
  if(!data) return null;
  const f = data || {};
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">Anamnesis completa</h3>

      {(f._flags && f._flags.length>0) && (
        <div className="mb-3 flex flex-wrap gap-2">{f._flags.map((x:string)=>(
          <span key={x} className="px-2 py-1 rounded-full text-xs bg-black text-white">{x}</span>
        ))}</div>
      )}

      <details open className="mb-2">
        <summary className="font-medium cursor-pointer">Datos y contexto</summary>
        <div className="mt-2">
          <Row label="Nombre" value={f.q1_nombre} />
          <Row label="Nacimiento" value={f.q2_nacimiento} />
          <Row label="Sexo" value={f.q3_sexo} />
          <Row label="Dominancia" value={f.q6_dominancia} />
          <Row label="Ocupación" value={f.q7_ocupacion} />
          <Row label="Trabajo implica" value={f.q8_trabajo} />
          <Row label="Deporte" value={f.q9_deporte} />
          {f.q9_deporte==="Sí" && (<>
            <Row label="Deportes" value={f.q9a_cuales} />
            <Row label="Frecuencia" value={f.q9b_frecuencia} />
            <Row label="Nivel" value={f.q9c_nivel} />
          </>)}
        </div>
      </details>

      <details open className="mb-2">
        <summary className="font-medium cursor-pointer">Motivo de consulta</summary>
        <div className="mt-2">
          <Row label="Motivo" value={f.q15_motivo} />
          <Row label="Evolución" value={`${f.q16_desde_cuando_num||""} ${f.q16_desde_cuando_ud||""}`} />
          <Row label="Inicio" value={f.q17_como_empezo} />
          {f.q17_como_empezo==="De forma repentina con un golpe o accidente" && <Row label="Descripción del golpe" value={f.q17a_golpe} />}
          <Row label="Zona principal" value={f.q18_donde} />
          <Row label="Irradia" value={f.q19_irradia} />
          {f.q19_irradia==="Se extiende" && <Row label="¿Hacia dónde?" value={f.q19a_a_donde} />}
          <Row label="Tipo dolor" value={f.q20_tipo} />
          <Row label="Intensidad (0–10)" value={f.q21_intensidad} />
          <Row label="Constante/intermitente" value={f.q22_constante} />
          {f.q22_constante==="Intermitente" && <Row label="Frecuencia/duración" value={f.q22a_frec} />}
          <Row label="Empeora" value={f.q23_empeora} />
          <Row label="Mejora" value={f.q24_mejora} />
          <Row label="Rigidez matinal" value={f.q25_rigidez} />
          {f.q25_rigidez==="Sí" && <Row label="Minutos rigidez" value={f.q25a_rigidez_min} />}
          <Row label="Dolor nocturno" value={f.q26_dolor_noche} />
          {f.q26_dolor_noche==="Sí" && <Row label="Mejora al cambiar postura" value={f.q26a_mejora_postura} />}
        </div>
      </details>

      <details className="mb-2">
        <summary className="font-medium cursor-pointer">Síntomas asociados / seguridad</summary>
        <div className="mt-2">
          {["q31_fiebre","q32_peso","q33_cancer","q36_esfinteres","q37_silla","q39_pecho"].some((k:string)=>f[k]==="Sí") && (
            <p className="text-xs text-red-600 mb-1">⚠︎ Alguna bandera roja marcada</p>
          )}
          <Row label="Fiebre/sudores" value={f.q31_fiebre} />
          <Row label="Pérdida de peso" value={f.q32_peso} />
          <Row label="Antecedente de cáncer" value={f.q33_cancer} />
          <Row label="Debilidad" value={f.q34_debilidad} />
          <Row label="Hormigueo/sensibilidad" value={f.q35_hormigueo} />
          {f.q35_hormigueo==="Sí" && <Row label="¿Dónde?" value={f.q35a_donde} />}
          <Row label="Esfínteres" value={f.q36_esfinteres} />
          <Row label="Silla de montar" value={f.q37_silla} />
          <Row label="Dolor invariante" value={f.q38_invariante} />
          <Row label="Dolor torácico / palpitaciones" value={f.q39_pecho} />
        </div>
      </details>

      <details>
        <summary className="font-medium cursor-pointer">Motivación y expectativas</summary>
        <div className="mt-2">
          <Row label="Estado emocional" value={f.q49_emocion} />
          <Row label="Miedo a moverse" value={f.q50_kinesiophobia} />
          <Row label="Creencia causa" value={f.q51_creencia} />
          <Row label="Objetivos" value={f.q52_esperas} />
          <Row label="Compromiso (0–10)" value={f.q53_compromiso} />
          <Row label="Resultado soñado" value={f.q56_cambio_vida} />
          <Row label="Urgencia (0–10)" value={f.q57_urgencia} />
          <Row label="Afectación (0–10)" value={f.q58_afectacion} />
          <Row label="Barreras" value={f.q62_barreras} />
        </div>
      </details>
    </div>
  );
}
