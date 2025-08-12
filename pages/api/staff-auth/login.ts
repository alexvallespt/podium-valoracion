import type { NextApiRequest, NextApiResponse } from "next";

function parseUsers(env?: string){
  const map: Record<string,string> = {};
  const src = env || "fisio@podium.local:1234";
  src.split(",").map(s=>s.trim()).forEach(pair=>{
    const [email, pass] = pair.split(":");
    if(email && pass){ map[email.toLowerCase()] = pass; }
  });
  return map;
}

export default function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=="POST") return res.status(405).end();
    const { email, password } = req.body || {};
    const users = parseUsers(process.env.STAFF_USERS);
    const ok = users[String(email||"").toLowerCase()] === String(password||"");
    if(!ok) return res.status(401).json({ ok:false, error:"Credenciales incorrectas" });
    const name = String(email||"");
    res.setHeader("Set-Cookie", [
      `staff=1; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`,
      `staffName=${encodeURIComponent(name)}; Path=/; SameSite=Lax; Max-Age=86400`
    ]);
    return res.status(200).json({ ok:true, name });
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message });
  }
}
