export function sendJson(res,status,payload){
  res.setHeader("Content-Type","application/json; charset=utf-8");
  res.setHeader("Cache-Control","no-store");
  res.status(status).json(payload);
}

export function requireMethod(req,res,method){
  if(req.method===method)return true;
  res.setHeader("Allow",method);
  sendJson(res,405,{error:"Deze aanvraag wordt niet ondersteund."});
  return false;
}

export function appUrl(){
  const configured=process.env.APP_URL|| (process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:"");
  if(!configured)return "";
  try{const url=new URL(configured);return ["https:","http:"].includes(url.protocol)?url.origin:""}catch{return ""}
}

export function envReady(){
  return Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function bankTransferReady(){
  const iban=String(process.env.BANK_IBAN||"").replace(/\s/g,"").toUpperCase();
  return envReady()&&Boolean(process.env.BANK_ACCOUNT_NAME&&/^[A-Z]{2}[A-Z0-9]{13,32}$/.test(iban));
}

export async function supabase(path,options={}){
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)throw new Error("Database configuration is missing");
  const response=await fetch(`${url.replace(/\/$/,"")}/rest/v1/${path}`,{
    ...options,
    headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",...(options.headers||{})}
  });
  const text=await response.text();let data=null;try{data=text?JSON.parse(text):null}catch{}
  if(!response.ok){const error=new Error("Supabase request failed");error.status=response.status;error.detail=data;throw error}
  return data;
}

export async function rpc(name,args){
  return supabase(`rpc/${name}`,{method:"POST",body:JSON.stringify(args)});
}

export function validCustomer(customer){
  if(!customer||typeof customer!=="object")return false;
  const {name,email,street,postal_code,city,country}=customer;
  return typeof name==="string"&&name.trim().length>=2&&name.trim().length<=120&&
    typeof email==="string"&&email.length<=254&&/^\S+@\S+\.\S+$/.test(email.trim())&&
    typeof street==="string"&&street.trim().length>=3&&street.trim().length<=180&&
    typeof postal_code==="string"&&/^[0-9A-Za-z -]{4,12}$/.test(postal_code.trim())&&
    typeof city==="string"&&city.trim().length>=2&&city.trim().length<=100&&
    ["NL","BE"].includes(country);
}

export function validItems(items){
  return Array.isArray(items)&&items.length>0&&items.length<=20&&items.every(item=>
    item&&Number.isSafeInteger(Number(item.product_id))&&Number(item.product_id)>0&&
    Number.isInteger(Number(item.quantity))&&Number(item.quantity)>=1&&Number(item.quantity)<=10&&
    ["S","M","L","XL","One size"].includes(item.size));
}
