
/**
 * 由 Fantastic-admin 提供技術支持
 * Powered by Fantastic-admin
 * https://fantastic-admin.github.io
 */

function t(e){return new RegExp("^(("+e.join(")|(")+"))\\b","i")}var n=["package","message","import","syntax","required","optional","repeated","reserved","default","extensions","packed","bool","bytes","double","enum","float","string","int32","int64","uint32","uint64","sint32","sint64","fixed32","fixed64","sfixed32","sfixed64","option","service","rpc","returns"],r=t(n),i=new RegExp("^[_A-Za-z¡-￿][_A-Za-z0-9¡-￿]*");function f(e){return e.eatSpace()?null:e.match("//")?(e.skipToEnd(),"comment"):e.match(/^[0-9\.+-]/,!1)&&(e.match(/^[+-]?0x[0-9a-fA-F]+/)||e.match(/^[+-]?\d*\.\d+([EeDd][+-]?\d+)?/)||e.match(/^[+-]?\d+([EeDd][+-]?\d+)?/))?"number":e.match(/^"([^"]|(""))*"/)||e.match(/^'([^']|(''))*'/)?"string":e.match(r)?"keyword":e.match(i)?"variable":(e.next(),null)}const u={name:"protobuf",token:f,languageData:{autocomplete:n}};export{u as protobuf};
