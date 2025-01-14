import{d as E,n as ae,u as re,t as s,E as ie,F as ce,G as ue,H as de,J as fe}from"./index-e5cf7f43.js";import{u as X}from"./useBasicLayout-18dd2ca5.js";import{d as q,e as c,r as p,f as Z,R as l,S,a2 as t,U as h,V as r,c as k,a4 as a,L as e,a6 as b,W as o,af as se,a8 as pe,j as me,F as _e,a7 as he,a3 as ve,H as xe}from"./vue-c19408e5.js";import{y as $,F as oe,e as ee,G as R,w as ge,H as te,I as H,J as O,K as W,d as we,L as ne,M as be,O as ye,P as Ce,E as ke,C as $e,Q as F,t as G,R as Pe}from"./naive-ui-64ac446a.js";import{a as Ne,f as Se}from"./crami-6a16f6dd.js";import"./vueuse-motion-563da5fd.js";const Q=""+new URL("avatar-e985e5ec.png",import.meta.url).href,Me={class:"flex flex-col justify-center items-center"},Ie={class:"text-2xl text-primary self-start mb-3 flex justify-between w-full"},De=t("span",null,null,-1),Ae={class:"mt-3 text-lg text-[#555]"},Te={class:"text-[#95aac9] mt-2"},Be={class:"self-start"},Le={class:"flex pl-3 pt-3 text-base font-bold text-primary"},Re={key:0,class:"flex pl-3 pt-3 text-base font-bold text-primary"},Ue={class:"flex items-center space-x-4 pl-3 mt-3"},je={class:"flex-shrink-0 w-24 text-primary"},ze={class:"w-[200px]"},We={class:"flex items-center space-x-4 pl-3 mt-3"},He={class:"flex-shrink-0 w-24 text-primary"},Ve={class:"w-[200px]"},Fe={class:"flex items-center space-x-4 pl-3 mt-3"},Ge={class:"flex-shrink-0 w-24 text-primary"},Oe={class:"w-[200px]"},Qe={key:1,class:"flex items-center space-x-4 pl-3 mt-3"},Ee={class:"flex-shrink-0 w-24 text-primary"},qe={class:"w-[200px]"},Ke={key:1},Je=q({__name:"detail",setup(K){const i=E(),n=ae(),{userBalance:d}=i,P=re(),v=c(()=>i.userInfo.email||""),M=c(()=>i.userInfo.isBindWx),A=p(i.userInfo.avatar??Q),T=p(i.userInfo.username??s("usercenter.notLoggedIn"));p(i.userInfo.sign??s("usercenter.defaultSignature"));const L=c(()=>Number(i.globalConfig.wechatRegisterStatus)===1);function B(){i.logOut(),n.replace("/")}const w=c(()=>i.isLogin);return Z(()=>{w.value||i.setLoginDialog(!0)}),(I,y)=>(l(),S("div",Me,[t("div",Ie,[De,w.value?(l(),h(e($),{key:0,tertiary:"",type:"error",onClick:B},{default:r(()=>[k(a(e(s)("usercenter.logOut")),1)]),_:1})):b("",!0),w.value?b("",!0):(l(),h(e($),{key:1,tertiary:"",type:"success",onClick:y[0]||(y[0]=C=>e(i).setLoginDialog(!0))},{default:r(()=>[k(a(e(s)("usercenter.clickToLogin")),1)]),_:1}))]),o(e(oe),{size:148,src:A.value,"fallback-src":e(Q)},null,8,["src","fallback-src"]),t("b",Ae,a(T.value),1),t("span",Te,a(v.value),1),t("div",Be,[t("div",Le,[t("span",null,a(e(s)("usercenter.myUsageRecord")),1)]),e(d).expirationTime?(l(),S("div",Re,[t("span",null,a(e(s)("usercenter.membershipExpiration")),1),t("span",null,a(e(d).expirationTime),1)])):b("",!0),t("div",Ue,[t("span",je,a(e(s)("usercenter.basicModelCredits")),1),t("div",ze,a(e(d).sumModel3Count||"0")+" "+a(e(s)("usercenter.points")),1)]),t("div",We,[t("span",He,a(e(s)("usercenter.advancedModelCredits")),1),t("div",Ve,a(e(d).sumModel4Count||"0")+" "+a(e(s)("usercenter.points")),1)]),t("div",Fe,[t("span",Ge,a(e(s)("usercenter.drawingUsageCredits")),1),t("div",Oe,a(e(d).sumDrawMjCount||"0")+" "+a(e(s)("usercenter.points")),1)]),L.value?(l(),S("div",Qe,[t("span",Ee,a(e(s)("usercenter.bindWeChat")),1),t("div",qe,[M.value?(l(),S("span",Ke,a(e(s)("usercenter.weChatBound")),1)):(l(),h(e($),{key:0,text:"",onClick:y[1]||(y[1]=C=>e(P).updateBindwxDialog(!0))},{default:r(()=>[k(a(e(s)("usercenter.clickToBindWeChat")),1)]),_:1}))])])):b("",!0)])]))}}),Ye={class:"flex justify-between"},Xe={class:"text-[#95AAC9]"},Ze={class:"text-base"},es={class:"text-[#95AAC9] mt-3"},ss={class:"ml-3 text-[#95AAC9] mt-2"},ts={class:"ml-3 text-[#95AAC9] mt-2"},as={class:"ml-3 text-[#95AAC9] mt-2"},rs=q({__name:"password",setup(K){const i=p({password:"",reenteredPassword:""}),n=i,d=p(null),P=p(null),v={password:[{required:!0,message:s("usercenter.enterPassword")}],reenteredPassword:[{required:!0,message:s("usercenter.reenterPassword"),trigger:["input","blur"]},{validator:M,message:s("usercenter.passwordsNotMatch"),trigger:"input"},{validator:A,message:s("usercenter.passwordsNotMatch"),trigger:["blur","password-input"]}]};function M(m,f){return!!i.value.password&&i.value.password.startsWith(f)&&i.value.password.length>=f.length}function A(m,f){return f===i.value.password}function T(){var m;i.value.reenteredPassword&&((m=P.value)==null||m.validate({trigger:"password-input"}))}const{isSmallXl:L}=X(),B=E(),w=ee();async function I(m){await ie(m),w.success(s("usercenter.passwordUpdateSuccess")),y(),B.updatePasswordSuccess()}function y(){i.value={password:"",reenteredPassword:""}}function C(m){var f;m.preventDefault(),(f=d.value)==null||f.validate(async x=>{if(!x){const{password:U}=i.value;I({password:U})}})}return(m,f)=>(l(),h(e(W),null,{header:r(()=>[t("div",null,a(e(s)("usercenter.changeYourPassword")),1)]),default:r(()=>[o(e(O),{"x-gap":24,"y-gap":24,cols:e(L)?1:3,class:"mt-3"},{default:r(()=>[o(e(R),{class:"border rounded-sm p-3 dark:border-[#ffffff17]",span:"2"},{default:r(()=>[o(e(ge),{ref_key:"formRef",ref:d,model:e(n),rules:v},{default:r(()=>[o(e(te),{path:"password",label:e(s)("usercenter.newPassword")},{default:r(()=>[o(e(H),{value:e(n).password,"onUpdate:value":f[0]||(f[0]=x=>e(n).password=x),type:"password",onInput:T,onKeydown:f[1]||(f[1]=se(pe(()=>{},["prevent"]),["enter"]))},null,8,["value"])]),_:1},8,["label"]),o(e(te),{ref_key:"rPasswordFormItemRef",ref:P,first:"",path:"reenteredPassword",label:e(s)("usercenter.confirmPassword")},{default:r(()=>[o(e(H),{value:e(n).reenteredPassword,"onUpdate:value":f[2]||(f[2]=x=>e(n).reenteredPassword=x),disabled:!e(n).password,type:"password",tabindex:"0",onKeyup:se(C,["enter"])},null,8,["value","disabled"])]),_:1},8,["label"]),t("div",Ye,[t("span",Xe,a(e(s)("usercenter.reloginAfterPasswordChange")),1),o(e($),{disabled:e(n).password===null,type:"primary",onClick:C},{default:r(()=>[k(a(e(s)("usercenter.updateYourPassword")),1)]),_:1},8,["disabled"])])]),_:1},8,["model"])]),_:1}),o(e(R),{class:"border rounded-sm p-3 dark:border-[#ffffff17]"},{default:r(()=>[t("b",Ze,a(e(s)("usercenter.passwordRequirements")),1),t("p",es,a(e(s)("usercenter.newPasswordInstructions")),1),t("div",ss,a(e(s)("usercenter.minimumCharacters")),1),t("div",ts,a(e(s)("usercenter.maximumCharacters")),1),t("div",as,a(e(s)("usercenter.requireNumber")),1)]),_:1})]),_:1},8,["cols"])]),_:1}))}}),os={1:s("rechargeTypes.1"),2:s("rechargeTypes.2"),3:s("rechargeTypes.3"),4:s("rechargeTypes.4"),5:s("rechargeTypes.5"),6:s("rechargeTypes.6"),7:s("rechargeTypes.7"),8:s("rechargeTypes.8")};s("orderStatus.0"),s("orderStatus.1"),s("orderStatus.2"),s("orderStatus.3");const ns={class:"flex h-full flex-col"},ls={class:"text-[#95aac9] mb-2 text-base"},is={class:"text-3xl text-[#555]"},cs={class:"ml-4 text-[#989898]"},us={class:"text-[#95aac9] mb-2 text-base"},ds={class:"text-3xl text-[#555]"},fs={class:"ml-4 text-[#989898]"},ps={class:"text-[#95aac9] mb-2 text-base"},ms={class:"text-3xl text-[#555]"},_s={class:"ml-4 text-[#989898]"},hs={class:"text-[#95aac9] mb-2 text-base"},vs={class:"relative"},xs=["src"],gs={class:"flex justify-between items-end min-h-28"},ws={class:"text-sm font-bold mr-1"},bs={class:"font-bold"},ys={class:"flex justify-between items-end min-h-28"},Cs={class:"text-sm font-bold mr-1"},ks={class:"font-bold"},$s={class:"flex justify-between items-end min-h-28"},Ps={class:"text-sm font-bold mr-1"},Ns={class:"font-bold"},Ss={class:"flex justify-between items-end mt-5"},Ms={class:"text-xl text-[red] font-bold"},Is=q({__name:"wallet",setup(K){const{isSmallMd:i,isMobile:n}=X(),d=E(),P=ee();we();const v=c(()=>d.userBalance),M=p(!1),A=p(""),T=p(!1),L=p([]),B=p(!1),w=c(()=>d.globalConfig.model3Name||s("usercenter.basicModelQuota")),I=c(()=>d.globalConfig.model4Name)||s("usercenter.advancedModelQuota"),y=c(()=>d.globalConfig.drawMjName)||s("usercenter.mjDrawingQuota"),C=c(()=>Number(d.globalConfig.isHideModel3Point)===1),m=c(()=>Number(d.globalConfig.isHideModel4Point)===1),f=c(()=>Number(d.globalConfig.isHideDrawMjPoint)===1),x=me({page:1,pageSize:10,showSizePicker:!0,pageSizes:[10,20,50],onChange:u=>{x.page=u,j()},onUpdatePageSize:u=>{x.pageSize=u,x.page=1,j()}}),U=c(()=>{const u=[{title:s("usercenter.orderNumber"),key:"uid"},{title:s("usercenter.rechargeType"),key:"rechargeType",render(D){return os[D.rechargeType]}},{title:s("usercenter.validity"),key:"expireDateCn"},{title:s("usercenter.rechargeTime"),key:"createdAt",render(D){return D.createdAt}}];return C.value||u.splice(2,0,{title:w.value,key:"model3Count"}),m.value||u.splice(3,0,{title:I.value,key:"model4Count"}),f.value||u.splice(4,0,{title:y.value,key:"drawMjCount"}),u}),z=p([]);async function j(){const u=await ce({page:x.page,size:x.pageSize}),{rows:D}=u.data;z.value=D}async function V(){P.warning(s("usercenter.enterCardSecret"));try{M.value=!0,await Ne({code:A.value}),P.success(s("usercenter.cardRedeemSuccess")),j(),d.getUserInfo(),M.value=!1}catch{P.error(s("usercenter.unknownError")),M.value=!1}}function J(){T.value=!0}async function Y(){const u=await Se({status:1,size:30});L.value=u.data.rows}const g=c(()=>{var u;return(u=d.globalConfig)==null?void 0:u.buyCramiAddress});function _(){window.open(g.value)}return Z(()=>{j()}),(u,D)=>(l(),S("div",ns,[o(e(W),null,{header:r(()=>[t("div",null,a(e(s)("usercenter.userWalletBalance")),1)]),default:r(()=>[o(e(O),{"x-gap":24,"y-gap":24,cols:e(i)?1:2,class:"mt-3"},{default:r(()=>[C.value?b("",!0):(l(),h(e(R),{key:0,class:"border dark:border-[#ffffff17] rounded-sm p-3"},{default:r(()=>[t("div",ls,a(w.value),1),t("b",is,a(v.value.sumModel3Count>99999?"無限額度":v.value.sumModel3Count??0),1),t("span",cs,a(e(s)("usercenter.creditUsageNote")),1)]),_:1})),m.value?b("",!0):(l(),h(e(R),{key:1,class:"border dark:border-[#ffffff17] rounded-sm p-3"},{default:r(()=>[t("div",us,a(e(I)),1),t("b",ds,a(v.value.sumModel4Count>99999?"無限額度":v.value.sumModel4Count??0),1),t("span",fs,a(e(s)("usercenter.modelConsumptionNote")),1)]),_:1})),f.value?b("",!0):(l(),h(e(R),{key:2,class:"border dark:border-[#ffffff17] rounded-sm p-3"},{default:r(()=>[t("div",ps,a(e(y)),1),t("b",ms,a(v.value.sumDrawMjCount>99999?"無限額度":v.value.sumDrawMjCount??0),1),t("span",_s,a(e(s)("usercenter.drawingConsumptionNote")),1)]),_:1})),o(e(R),{class:"border dark:border-[#ffffff17] rounded-sm p-3"},{default:r(()=>[t("div",hs,a(e(s)("usercenter.cardRecharge")),1),o(e(ne),{wrap:!1},{default:r(()=>[o(e(H),{value:A.value,"onUpdate:value":D[0]||(D[0]=N=>A.value=N),placeholder:e(s)("usercenter.enterCardDetails"),class:"mr-3",maxlength:"128","show-count":"",clearable:""},null,8,["value","placeholder"]),o(e($),{type:"primary",loading:M.value,onClick:V},{default:r(()=>[k(a(e(s)("usercenter.exchange")),1)]),_:1},8,["loading"]),g.value?(l(),h(e($),{key:0,type:"success",onClick:J},{default:r(()=>[k(a(e(s)("usercenter.buyCardSecret")),1)]),_:1})):b("",!0)]),_:1})]),_:1})]),_:1},8,["cols"])]),_:1}),o(e(W),{class:"mt-5 flex-1"},{header:r(()=>[t("div",null,a(e(s)("usercenter.rechargeRecords")),1)]),default:r(()=>[o(e(be),{columns:U.value,loading:B.value,"scroll-x":800,data:z.value,"max-height":"280",pagination:x},null,8,["columns","loading","data","pagination"])]),_:1}),o(e(Ce),{show:T.value,"onUpdate:show":D[1]||(D[1]=N=>T.value=N),width:e(i)?"100%":502,"on-after-enter":Y},{default:r(()=>[o(e(ye),{title:"{{ t('usercenter.packagePurchase') }}",closable:""},{default:r(()=>[o(e(O),{"x-gap":15,"y-gap":15,cols:e(i)?1:2,class:"mt-3"},{default:r(()=>[(l(!0),S(_e,null,he(L.value,(N,le)=>(l(),h(e(R),{key:le},{default:r(()=>[o(e(W),{size:"small",embedded:""},{header:r(()=>[t("div",vs,[t("b",null,a(N.name),1)])]),cover:r(()=>[t("img",{src:N.coverImg},null,8,xs)]),default:r(()=>[t("div",null,[t("p",null,a(N.des),1),t("div",gs,[t("span",ws,a(w.value),1),t("span",bs,a(N.model3Count),1)]),t("div",ys,[t("span",Cs,a(e(I)),1),t("span",ks,a(N.model4Count),1)]),t("div",$s,[t("span",Ps,a(e(y)),1),t("span",Ns,a(N.drawMjCount),1)]),t("div",Ss,[t("i",Ms,a(`NT$${N.price}`),1),o(e($),{type:"primary",dashed:"",size:"small",onClick:_},{default:r(()=>[k(a(e(s)("usercenter.buyPackage")),1)]),_:1})])])]),_:2},1024)]),_:2},1024))),128))]),_:1},8,["cols"])]),_:1})]),_:1},8,["show","width"])]))}}),Ds={class:"flex flex-col justify-center items-center"},As={class:"text-2xl text-primary self-start mb-14 flex justify-between w-full"},Ts={class:"mt-3 text-lg text-[#555]"},Bs={class:"self-start mt-16"},Ls={class:"text-xl text-primary"},Rs={class:"flex items-center space-x-4 pl-3 mt-3"},Us={class:"flex-shrink-0 w-[150px] text-keft text-primary"},js={class:"w-[230px]"},zs={class:"flex items-center space-x-4 pl-3 mt-3"},Ws={class:"flex-shrink-0 w-[150px] text-keft text-primary"},Hs={class:"w-[230px]"},Vs={key:0,class:"flex items-center space-x-4 pl-3 mt-3"},Fs={class:"flex-shrink-0 w-[150px] text-keft text-primary"},Gs={class:"w-[230px]"},Os={key:1},Qs={key:1,class:"flex items-center space-x-4 pl-3 mt-3"},Es={class:"flex-shrink-0 w-[150px] text-keft text-primary"},qs={class:"w-[230px]"},Ks={key:0,class:"flex text-[red] pt-8 text-base font-bold"},Js={key:1},Ys={class:"flex items-center space-x-4"},Xs={class:"flex-shrink-0 w-[60px]"},Zs={class:"flex-1"},et={class:"flex items-center space-x-4 mt-5"},st={class:"flex-shrink-0 w-[60px]"},tt={class:"flex-1"},ct=q({__name:"index",setup(K){const i=re(),n=E(),d=ae(),P=p(0),v=c(()=>n.userBalance),M=c(()=>{var g;return(g=n.globalConfig)==null?void 0:g.isUseWxLogin}),A=c(()=>Number(n.globalConfig.wechatRegisterStatus)===1),T=c(()=>n.globalConfig.model3Name||s("goods.basicModelQuota")),L=c(()=>n.globalConfig.model4Name)||s("goods.advancedModelQuota");c(()=>n.globalConfig.drawMjName)||s("goods.drawingQuota"),c(()=>Number(n.globalConfig.isHideModel3Point)===1),c(()=>Number(n.globalConfig.isHideModel4Point)===1),c(()=>Number(n.globalConfig.isHideDrawMjPoint)===1);const B=p(!0),w=c(()=>n.isLogin),I=ee();c(()=>n.userInfo.email||"");const y=c(()=>n.userInfo.isBindWx),C=p(n.userInfo.avatar??Q),m=p(n.userInfo.username??"未登錄");p(n.userInfo.sign??s("usercenter.defaultSignature"));const f=p(!1),{isSmallLg:x,isMobile:U}=X();async function z(){const g=await ue();P.value=g.data||0}async function j(){(await de()).success&&I.success(s("usercenter.syncComplete")),z()}async function V(g){try{f.value=!0;const _=await fe(g);if(f.value=!1,!_.success)return I.error(_.message);I.success(s("common.updateUserSuccess")),n.getUserInfo()}catch{f.value=!1}}function J(){w.value||(d.replace("/"),n.setLoginDialog(!0))}Z(()=>{J(),z()});function Y(){n.logOut(),d.replace("/")}return setTimeout(()=>{B.value=!1},500),(g,_)=>(l(),h(e(ke),{"has-sider":"",class:"flex h-full"},{default:r(()=>[e(x)?b("",!0):(l(),h(e($e),{key:0,"content-style":"padding: 24px;",bordered:"",width:"380"},{default:r(()=>[t("div",Ds,[t("div",As,[t("span",null,a(e(s)("usercenter.personalCenter")),1),o(e($),{tertiary:"",type:"error",onClick:Y},{default:r(()=>[k(a(e(s)("usercenter.logOut")),1)]),_:1})]),o(e(oe),{size:148,src:C.value,"fallback-src":e(Q)},null,8,["src","fallback-src"]),t("b",Ts,a(m.value),1),t("div",Bs,[t("div",Ls,a(e(s)("usercenter.myUsageRecord")),1),t("div",Rs,[t("span",Us,a(T.value),1),t("div",js,a(v.value.useModel3Count||"0")+" "+a(e(s)("usercenter.points")),1)]),t("div",zs,[t("span",Ws,a(e(L)),1),t("div",Hs,a(v.value.useModel4Count||"0")+" "+a(e(s)("usercenter.points")),1)]),M.value&&A.value?(l(),S("div",Vs,[t("span",Fs,a(e(s)("usercenter.bindWeChat")),1),t("div",Gs,[y.value?(l(),S("span",Os,a(e(s)("usercenter.weChatBound")),1)):(l(),h(e($),{key:0,text:"",onClick:_[0]||(_[0]=u=>e(i).updateBindwxDialog(!0))},{default:r(()=>[k(a(e(s)("usercenter.clickToBindWeChat")),1)]),_:1}))])])):b("",!0),P.value>0?(l(),S("div",Qs,[t("span",Es,a(e(s)("usercenter.clickToBindWeChat")),1),t("div",qs,[o(e($),{text:"",onClick:j},{default:r(()=>[k(a(e(s)("usercenter.syncVisitorData")),1)]),_:1})])])):b("",!0)])]),v.value.expirationTime?(l(),S("div",Ks,[t("span",null,a(e(s)("usercenter.membershipExpiration")),1),t("span",null,a(v.value.expirationTime),1)])):b("",!0)]),_:1})),t("div",{class:ve(["flex flex-col",[e(U)?"w-full":"flex-1"]]),style:xe({padding:e(U)?"10px":"0 28px 0 28px"})},[o(e(Pe),{type:"line",animated:"",class:"mt-5 flex-1"},{default:r(()=>[e(x)?(l(),h(e(F),{key:0,name:"detail",tab:e(s)("usercenter.myDetails")},{default:r(()=>[o(Je)]),_:1},8,["tab"])):b("",!0),o(e(F),{name:"account",tab:e(s)("usercenter.myWallet")},{default:r(()=>[o(Is)]),_:1},8,["tab"]),o(e(F),{name:"baseInfo",tab:e(s)("usercenter.basicInfo")},{default:r(()=>[o(e(W),null,{header:r(()=>[B.value||!w.value?(l(),h(e(G),{key:0,size:"medium",width:"20%"})):(l(),S("div",Js,a(e(s)("usercenter.userBasicSettings")),1))]),default:r(()=>[B.value||!w.value?(l(),h(e(ne),{key:0,vertical:""},{default:r(()=>[o(e(G),{height:"40px",size:"medium"}),o(e(G),{height:"40px",size:"medium"}),o(e(G),{height:"80px",size:"medium"})]),_:1})):(l(),h(e(O),{key:1,"x-gap":"12",cols:1},{default:r(()=>[o(e(R),null,{default:r(()=>[t("div",Ys,[t("span",Xs,a(g.$t("setting.avatarLink")),1),t("div",Zs,[o(e(H),{value:C.value,"onUpdate:value":_[1]||(_[1]=u=>C.value=u),placeholder:e(s)("usercenter.avatarPlaceholder")},null,8,["value","placeholder"])]),o(e($),{size:"tiny",text:"",type:"primary",onClick:_[2]||(_[2]=u=>V({avatar:C.value}))},{default:r(()=>[k(a(g.$t("common.update")),1)]),_:1})]),t("div",et,[t("span",st,a(g.$t("setting.name")),1),t("div",tt,[o(e(H),{value:m.value,"onUpdate:value":_[3]||(_[3]=u=>m.value=u),placeholder:e(s)("usercenter.usernamePlaceholder"),maxlength:"12","show-count":"",clearable:""},null,8,["value","placeholder"])]),o(e($),{size:"tiny",text:"",type:"primary",onClick:_[4]||(_[4]=u=>V({username:m.value}))},{default:r(()=>[k(a(g.$t("common.update")),1)]),_:1})])]),_:1})]),_:1}))]),_:1})]),_:1},8,["tab"]),o(e(F),{name:"password",tab:e(s)("usercenter.passwordManagement")},{default:r(()=>[o(rs)]),_:1},8,["tab"])]),_:1})],6)]),_:1}))}});export{ct as default};
