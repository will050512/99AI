
/**
 * 由 Fantastic-admin 提供技術支持
 * Powered by Fantastic-admin
 * https://fantastic-admin.github.io
 */

const i={name:"spreadsheet",startState:function(){return{stringType:null,stack:[]}},token:function(e,n){if(e){switch(n.stack.length===0&&(e.peek()=='"'||e.peek()=="'")&&(n.stringType=e.peek(),e.next(),n.stack.unshift("string")),n.stack[0]){case"string":for(;n.stack[0]==="string"&&!e.eol();)e.peek()===n.stringType?(e.next(),n.stack.shift()):e.peek()==="\\"?(e.next(),e.next()):e.match(/^.[^\\\"\']*/);return"string";case"characterClass":for(;n.stack[0]==="characterClass"&&!e.eol();)e.match(/^[^\]\\]+/)||e.match(/^\\./)||n.stack.shift();return"operator"}var c=e.peek();switch(c){case"[":return e.next(),n.stack.unshift("characterClass"),"bracket";case":":return e.next(),"operator";case"\\":return e.match(/\\[a-z]+/)?"string.special":(e.next(),"atom");case".":case",":case";":case"*":case"-":case"+":case"^":case"<":case"/":case"=":return e.next(),"atom";case"$":return e.next(),"builtin"}return e.match(/\d+/)?e.match(/^\w+/)?"error":"number":e.match(/^[a-zA-Z_]\w*/)?e.match(/(?=[\(.])/,!1)?"keyword":"variable":["[","]","(",")","{","}"].indexOf(c)!=-1?(e.next(),"bracket"):(e.eatSpace()||e.next(),null)}}};export{i as spreadsheet};
