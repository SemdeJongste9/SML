import {sendJson,requireMethod,supabase,rpc,bankTransferReady} from "../lib/server.js";

export default async function handler(req,res){
  if(!requireMethod(req,res,"GET"))return;
  try{
    await rpc("expire_transfer_orders",{});
    const rows=await supabase("products?select=id,name,description,price_cents,image_url,product_type,color,badge,categories(name),product_variants(size,stock)&active=eq.true&order=id.asc");
    const products=(rows||[]).map(product=>({
      id:Number(product.id),name:product.name,description:product.description,price_cents:product.price_cents,
      image_url:product.image_url,product_type:product.product_type,color:product.color,badge:product.badge,
      category:product.categories?.name||"Collectie",
      sizes:(product.product_variants||[]).filter(variant=>variant.stock>0).map(variant=>variant.size)
    }));
    sendJson(res,200,{products,databaseReady:true,checkoutReady:bankTransferReady()});
  }catch(error){
    console.error("Catalog request failed",error.status||"unknown");
    sendJson(res,503,{error:"De productcatalogus is tijdelijk niet beschikbaar."});
  }
}
