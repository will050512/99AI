
/**
 * 由 Fantastic-admin 提供技術支持
 * Powered by Fantastic-admin
 * https://fantastic-admin.github.io
 */

import{_ as N}from"./index.vue_vue_type_script_setup_true_lang-BTce45WY.js";import{d as S,m as M,r as f,a as T,p as n,g as p,c as j,b as e,w as t,h as v,z as q,A as U,e as s,G as g,j as $,_ as A,k as h}from"./index-nGFMSQGw.js";import{a as x}from"./config-CYXO1pNF.js";const E=s("div",{class:"flex items-center gap-4"},"歡迎頁設置",-1),I=s("div",{class:"text-sm/6"},[s("div",null," 歡迎頁設置支持配置訪問首頁時的默認顯示內容。可以啟用歡迎頁，或直接跳轉到聊天頁面。 "),s("div",null,"若啟用歡迎頁，可以在此處自定義歡迎頁面內容。"),s("div",{class:"mt-2 text-gray-500"},[s("strong",null,"推薦："),v(" 您可以在其他專業的 HTML 編輯器（如 VS Code、Sublime Text）中編輯歡迎頁面內容並複製粘貼到此處，以獲得更好的編輯體驗。 ")])],-1),L=["srcdoc"],O=S({__name:"welcomePageSettings",setup(R){const o=M({clientHomePath:"",homeHtml:""}),y=f({siteName:[{required:!0,trigger:"blur",message:"請填寫網站名稱"}]}),i=f();async function d(){const a=await x.queryConfig({keys:["clientHomePath","homeHtml"]});Object.assign(o,a.data)}function H(){var a;(a=i.value)==null||a.validate(async l=>{if(l){try{await x.setConfig({settings:b(o)}),g.success("變更歡迎頁設置成功")}catch{}d()}else g.error("請填寫完整資訊")})}function b(a){return Object.keys(a).map(l=>({configKey:l,configVal:a[l]}))}return T(()=>{d()}),(a,l)=>{const u=$,w=A,V=N,C=n("el-switch"),c=n("el-form-item"),r=n("el-col"),_=n("el-row"),k=n("el-input"),P=n("el-form"),B=n("el-card");return p(),j("div",null,[e(V,null,{title:t(()=>[E]),content:t(()=>[I]),default:t(()=>[e(w,{outline:"",onClick:H},{default:t(()=>[e(u,{name:"i-ri:file-text-line"}),v(" 保存設置 ")]),_:1})]),_:1}),e(B,{style:{margin:"20px"}},{default:t(()=>[e(P,{ref_key:"formRef",ref:i,rules:y.value,model:o,"label-width":"150px"},{default:t(()=>[e(_,null,{default:t(()=>[e(r,{xs:24,md:24,lg:24,xl:24},{default:t(()=>[e(c,{label:"開啟歡迎頁",prop:"clientHomePath"},{default:t(()=>[e(C,{modelValue:o.clientHomePath,"onUpdate:modelValue":l[0]||(l[0]=m=>o.clientHomePath=m),"active-value":"/home","inactive-value":"/chat"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),o.clientHomePath==="/home"?(p(),q(_,{key:0},{default:t(()=>[e(r,{xs:24,md:20,lg:15,xl:12},{default:t(()=>[e(c,{label:"歡迎頁（HTML）",prop:"homeHtml"},{default:t(()=>[e(k,{modelValue:o.homeHtml,"onUpdate:modelValue":l[1]||(l[1]=m=>o.homeHtml=m),placeholder:"請輸入自定義歡迎頁內容",type:"textarea",rows:10,clearable:""},null,8,["modelValue"])]),_:1})]),_:1})]),_:1})):U("",!0),e(r,{xs:28,md:24,lg:20,xl:12,style:{"margin-top":"20px"}},{default:t(()=>[e(c,{label:"預覽"},{default:t(()=>[s("iframe",{class:"w-full h-100 border border-gray-200 rounded-md bg-gray-100",srcdoc:o.homeHtml,sandbox:"allow-same-origin allow-scripts"},null,8,L)]),_:1})]),_:1})]),_:1},8,["rules","model"])]),_:1})])}}});typeof h=="function"&&h(O);export{O as default};
