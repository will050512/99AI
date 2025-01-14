
/**
 * 由 Fantastic-admin 提供技術支持
 * Powered by Fantastic-admin
 * https://fantastic-admin.github.io
 */

import{_ as I}from"./index.vue_vue_type_script_setup_true_lang-BTce45WY.js";import{d as k,m as N,r as g,a as q,p as s,g as T,c as L,b as e,w as l,h as m,e as d,G as h,j as U,_ as B,k as y}from"./index-nGFMSQGw.js";import{a as P}from"./config-CYXO1pNF.js";const j=d("div",{class:"flex items-center gap-4"},"手機驗證碼登錄設置",-1),D=d("div",{class:"text-sm/6"},[d("div",null,[m(" 手機驗證使用"),d("a",{href:"https://dysms.console.aliyun.com/overview",target:"_blank"},"阿里雲短信服務"),m("，請先申請好籤名模板以及獲取到您的秘鑰資訊。 ")]),d("div",null,"當您配置並開啟後則表示開啟用戶端手機號註冊的行為！")],-1),$=k({__name:"phone",setup(E){const a=N({phoneLoginStatus:"",aliPhoneAccessKeyId:"",aliPhoneAccessKeySecret:"",aliPhoneSignName:"",aliPhoneTemplateCode:""}),S=g({phoneLoginStatus:[{required:!1,trigger:"blur",message:"請選擇是否開啟手機號登錄"}],aliPhoneAccessKeyId:[{required:!1,trigger:"blur",message:"請填寫阿里雲短信服務accessKeyId"}],aliPhoneAccessKeySecret:[{required:!1,trigger:"blur",message:"請填寫阿里雲短信服務accessKeySecret"}],aliPhoneSignName:[{required:!1,trigger:"blur",message:"請填寫阿里雲短信服務的模板簽名"}],aliPhoneTemplateCode:[{required:!1,trigger:"blur",message:"請填寫阿里雲短信服務的模板ID"}]}),p=g();async function f(){const n=await P.queryConfig({keys:["phoneLoginStatus","aliPhoneAccessKeyId","aliPhoneAccessKeySecret","aliPhoneSignName","aliPhoneTemplateCode"]});Object.assign(a,n.data)}function b(){var n;(n=p.value)==null||n.validate(async o=>{if(o){try{await P.setConfig({settings:x(a)}),h.success("變更配置資訊成功")}catch{}f()}else h.error("請填寫完整資訊")})}function x(n){return Object.keys(n).map(o=>({configKey:o,configVal:n[o]}))}return q(()=>{f()}),(n,o)=>{const _=U,K=B,V=I,v=s("el-switch"),A=s("el-tooltip"),c=s("el-form-item"),r=s("el-col"),i=s("el-row"),u=s("el-input"),w=s("el-form"),C=s("el-card");return T(),L("div",null,[e(V,null,{title:l(()=>[j]),content:l(()=>[D]),default:l(()=>[e(K,{text:"",outline:"",onClick:b},{default:l(()=>[e(_,{name:"i-ri:file-text-line"}),m(" 保存設置 ")]),_:1})]),_:1}),e(C,{style:{margin:"20px"}},{default:l(()=>[e(w,{ref_key:"formRef",ref:p,rules:S.value,model:a,"label-width":"170px"},{default:l(()=>[e(i,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"開啟手機號註冊/登錄",prop:"phoneLoginStatus"},{default:l(()=>[e(A,{class:"box-item",effect:"dark",content:"如您啟用短信登錄、則用戶端則可以通過手機號的方式登錄！",placement:"right"},{default:l(()=>[e(v,{modelValue:a.phoneLoginStatus,"onUpdate:modelValue":o[0]||(o[0]=t=>a.phoneLoginStatus=t),"active-value":"1","inactive-value":"0"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1}),e(i,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"AccessKeyId",prop:"aliPhoneAccessKeyId"},{default:l(()=>[e(u,{modelValue:a.aliPhoneAccessKeyId,"onUpdate:modelValue":o[1]||(o[1]=t=>a.aliPhoneAccessKeyId=t),placeholder:"請填寫AccessKeyId",clearable:"",type:"password","show-password":""},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(i,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"AccessKeySecret",prop:"aliPhoneAccessKeySecret"},{default:l(()=>[e(u,{modelValue:a.aliPhoneAccessKeySecret,"onUpdate:modelValue":o[2]||(o[2]=t=>a.aliPhoneAccessKeySecret=t),placeholder:"請填寫AccessKeySecret",clearable:"",type:"password","show-password":""},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(i,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"短信簽名",prop:"aliPhoneSignName"},{default:l(()=>[e(u,{modelValue:a.aliPhoneSignName,"onUpdate:modelValue":o[3]||(o[3]=t=>a.aliPhoneSignName=t),placeholder:"請填寫您申請的短信簽名",clearable:""},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),e(i,null,{default:l(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:l(()=>[e(c,{label:"短信模板ID",prop:"aliPhoneTemplateCode"},{default:l(()=>[e(u,{modelValue:a.aliPhoneTemplateCode,"onUpdate:modelValue":o[4]||(o[4]=t=>a.aliPhoneTemplateCode=t),placeholder:"請填寫短信模板ID",clearable:""},null,8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1},8,["rules","model"])]),_:1})])}}});typeof y=="function"&&y($);export{$ as default};
