
/**
 * 由 Fantastic-admin 提供技術支持
 * Powered by Fantastic-admin
 * https://fantastic-admin.github.io
 */

import{_ as h}from"./index.vue_vue_type_script_setup_true_lang-BTce45WY.js";import{d as B,m as I,r as C,n as R,a as U,p as n,g as D,c as N,b as e,w as l,h as p,i as m,e as f,G as y,j,_ as q,k as V}from"./index-nGFMSQGw.js";import{a as x}from"./config-CYXO1pNF.js";const $=f("div",{class:"flex items-center gap-4"},"阿里雲OSS參數設置",-1),E=f("div",{class:"text-sm/6"},[f("div",null,[p(" 需前往阿里雲申請對象儲存服務，更多配置及申請詳見"),f("a",{href:"https://oss.console.aliyun.com",target:"_blank"},"阿里雲OSS"),p(" 。如果同時開啟多個儲存服務，騰訊雲優先級高於阿里雲。 ")])],-1),H=B({__name:"ali",setup(M){const a=I({aliOssStatus:"",aliOssAccessKeyId:"",aliOssAccessKeySecret:"",aliOssRegion:"",aliOssBucket:"",aliOssAcceleratedDomain:""}),_=C();async function O(){const o=await x.queryConfig({keys:["aliOssAccessKeySecret","aliOssRegion","aliOssBucket","aliOssAccessKeyId","aliOssStatus","aliOssAcceleratedDomain"]});Object.assign(a,o.data)}function S(){var o;(o=_.value)==null||o.validate(async s=>{if(s){try{await x.setConfig({settings:b(a)}),y.success("變更配置資訊成功")}catch{}O()}else y.error("請填寫完整資訊")})}function b(o){return Object.keys(o).map(s=>({configKey:s,configVal:o[s]}))}const d=R(()=>[{required:Number(a.aliOssStatus)===1,message:"開啟配置後請填寫此項",trigger:"change"}]);return U(()=>{O()}),(o,s)=>{const g=j,A=q,w=h,k=n("el-switch"),c=n("el-form-item"),r=n("el-col"),u=n("el-row"),i=n("el-input"),v=n("el-form"),K=n("el-card");return D(),N("div",null,[e(w,null,{title:l(()=>[$]),content:l(()=>[E]),default:l(()=>[e(A,{outline:"",onClick:S},{default:l(()=>[e(g,{name:"i-ri:file-text-line"}),p(" 保存設置 ")]),_:1})]),_:1}),e(K,{style:{margin:"20px"}},{default:l(()=>[e(v,{ref_key:"formRef",ref:_,model:a,"label-width":"120px"},{default:l(()=>[e(u,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"服務啟用狀態",prop:"aliOssStatus"},{default:l(()=>[e(k,{modelValue:a.aliOssStatus,"onUpdate:modelValue":s[0]||(s[0]=t=>a.aliOssStatus=t),"active-value":"1","inactive-value":"0"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(u,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"accessKeyId",prop:"aliOssAccessKeyId",rules:m(d)},{default:l(()=>[e(i,{modelValue:a.aliOssAccessKeyId,"onUpdate:modelValue":s[1]||(s[1]=t=>a.aliOssAccessKeyId=t),placeholder:"請填寫SecretId",clearable:"",type:"password","show-password":""},null,8,["modelValue"])]),_:1},8,["rules"])]),_:1})]),_:1}),e(u,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"keySecret",prop:"aliOssAccessKeySecret",rules:m(d)},{default:l(()=>[e(i,{modelValue:a.aliOssAccessKeySecret,"onUpdate:modelValue":s[2]||(s[2]=t=>a.aliOssAccessKeySecret=t),placeholder:"請填寫SecretKey",clearable:"",type:"password","show-password":""},null,8,["modelValue"])]),_:1},8,["rules"])]),_:1})]),_:1}),e(u,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"儲存桶名稱",prop:"aliOssBucket",rules:m(d)},{default:l(()=>[e(i,{modelValue:a.aliOssBucket,"onUpdate:modelValue":s[3]||(s[3]=t=>a.aliOssBucket=t),placeholder:"請填寫儲存桶名稱",clearable:""},null,8,["modelValue"])]),_:1},8,["rules"])]),_:1})]),_:1}),e(u,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"所屬地域",prop:"aliOssRegion",rules:m(d)},{default:l(()=>[e(i,{modelValue:a.aliOssRegion,"onUpdate:modelValue":s[4]||(s[4]=t=>a.aliOssRegion=t),placeholder:"請填寫所屬地域(oss-cn-shanghai)",clearable:""},null,8,["modelValue"])]),_:1},8,["rules"])]),_:1})]),_:1}),e(u,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"全球加速網域名稱",prop:"aliOssAcceleratedDomain"},{default:l(()=>[e(i,{modelValue:a.aliOssAcceleratedDomain,"onUpdate:modelValue":s[5]||(s[5]=t=>a.aliOssAcceleratedDomain=t),placeholder:"如您是國外服務器可開啟全球加速網域名稱得到更快響應速度、同理也會更高計費！",clearable:""},null,8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1},8,["model"])]),_:1})])}}});typeof V=="function"&&V(H);export{H as default};
