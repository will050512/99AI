
/**
 * 由 Fantastic-admin 提供技術支持
 * Powered by Fantastic-admin
 * https://fantastic-admin.github.io
 */

import u from"./index-DYuViJCA.js";import g from"./index-DilPWwlM.js";import{d as h,u as f,n as c,r as p,a as _,O as y,X as v,g as s,c as w,i as e,z as l,A as d,Q as T,l as k}from"./index-nGFMSQGw.js";import"./index-CyI3Kccs.js";import"./useMainPage-C9MASyfo.js";import"./leftSide.vue_vue_type_script_setup_true_lang-CY8It3ua.js";import"./index-D5jQENXK.js";import"./index-CeCYhShg.js";import"./item.vue_vue_type_script_setup_true_lang-B8QwDp3s.js";import"./rightSide.vue_vue_type_script_setup_true_lang-oHdyjiaC.js";import"./HDropdownMenu.vue_vue_type_script_setup_true_lang-Dgz-jknv.js";import"./index.vue_vue_type_script_setup_true_lang-1hGRIBXM.js";import"./HDropdown-BjwO9ikd.js";import"./HTabList.vue_vue_type_script_setup_true_lang-P9EIXJZ1.js";import"./use-resolve-button-type-CVaAVCZ2.js";import"./index.vue_vue_type_script_setup_true_lang-BWhJNsuM.js";import"./index.vue_vue_type_script_setup_true_lang-CXCJ8paG.js";import"./HKbd-By3ZrrUU.js";import"./index.vue_vue_type_script_setup_true_lang-DwWyQI_t.js";const E=h({name:"Topbar",__name:"index",setup(S){const t=f(),a=c(()=>!(t.settings.menu.menuMode==="head"&&(!t.settings.toolbar.breadcrumb||t.settings.app.routeBaseOn==="filesystem"))),n=p(0),m=p(!1),b=c(()=>{const o=t.settings.tabbar.enable?Number.parseInt(getComputedStyle(document.documentElement||document.body).getPropertyValue("--g-tabbar-height")):0,r=a.value?Number.parseInt(getComputedStyle(document.documentElement||document.body).getPropertyValue("--g-toolbar-height")):0;return o+r});_(()=>{window.addEventListener("scroll",i)}),y(()=>{window.removeEventListener("scroll",i)});function i(){n.value=(document.documentElement||document.body).scrollTop}return v(n,(o,r)=>{m.value=t.settings.topbar.mode==="sticky"&&o>r&&o>b.value}),(o,r)=>(s(),w("div",{class:T(["topbar-container",{"has-tabbar":e(t).settings.tabbar.enable,"has-toolbar":e(a),[`topbar-${e(t).settings.topbar.mode}`]:!0,shadow:e(n),hide:e(m)}]),"data-fixed-calc-width":""},[e(t).settings.tabbar.enable?(s(),l(u,{key:0})):d("",!0),e(a)?(s(),l(g,{key:1})):d("",!0)],2))}}),D=k(E,[["__scopeId","data-v-a6c8b676"]]);export{D as default};
