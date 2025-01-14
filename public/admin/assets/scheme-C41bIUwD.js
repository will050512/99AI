
/**
 * 由 Fantastic-admin 提供技術支持
 * Powered by Fantastic-admin
 * https://fantastic-admin.github.io
 */

var E="builtin",a="comment",g="string",x="symbol",c="atom",b="number",v="bracket",S=2;function w(e){for(var n={},i=e.split(" "),t=0;t<i.length;++t)n[i[t]]=!0;return n}var k=w("λ case-lambda call/cc class cond-expand define-class define-values exit-handler field import inherit init-field interface let*-values let-values let/ec mixin opt-lambda override protect provide public rename require require-for-syntax syntax syntax-case syntax-error unit/sig unless when with-syntax and begin call-with-current-continuation call-with-input-file call-with-output-file case cond define define-syntax define-macro defmacro delay do dynamic-wind else for-each if lambda let let* let-syntax letrec letrec-syntax map or syntax-rules abs acos angle append apply asin assoc assq assv atan boolean? caar cadr call-with-input-file call-with-output-file call-with-values car cdddar cddddr cdr ceiling char->integer char-alphabetic? char-ci<=? char-ci<? char-ci=? char-ci>=? char-ci>? char-downcase char-lower-case? char-numeric? char-ready? char-upcase char-upper-case? char-whitespace? char<=? char<? char=? char>=? char>? char? close-input-port close-output-port complex? cons cos current-input-port current-output-port denominator display eof-object? eq? equal? eqv? eval even? exact->inexact exact? exp expt #f floor force gcd imag-part inexact->exact inexact? input-port? integer->char integer? interaction-environment lcm length list list->string list->vector list-ref list-tail list? load log magnitude make-polar make-rectangular make-string make-vector max member memq memv min modulo negative? newline not null-environment null? number->string number? numerator odd? open-input-file open-output-file output-port? pair? peek-char port? positive? procedure? quasiquote quote quotient rational? rationalize read read-char real-part real? remainder reverse round scheme-report-environment set! set-car! set-cdr! sin sqrt string string->list string->number string->symbol string-append string-ci<=? string-ci<? string-ci=? string-ci>=? string-ci>? string-copy string-fill! string-length string-ref string-set! string<=? string<? string=? string>=? string>? string? substring symbol->string symbol? #t tan transcript-off transcript-on truncate values vector vector->list vector-fill! vector-length vector-ref vector-set! with-input-from-file with-output-to-file write write-char zero?"),q=w("define let letrec let* lambda define-macro defmacro let-syntax letrec-syntax let-values let*-values define-syntax syntax-rules define-values when unless");function C(e,n,i){this.indent=e,this.type=n,this.prev=i}function s(e,n,i){e.indentStack=new C(n,i,e.indentStack)}function N(e){e.indentStack=e.indentStack.prev}var M=new RegExp(/^(?:[-+]i|[-+][01]+#*(?:\/[01]+#*)?i|[-+]?[01]+#*(?:\/[01]+#*)?@[-+]?[01]+#*(?:\/[01]+#*)?|[-+]?[01]+#*(?:\/[01]+#*)?[-+](?:[01]+#*(?:\/[01]+#*)?)?i|[-+]?[01]+#*(?:\/[01]+#*)?)(?=[()\s;"]|$)/i),Q=new RegExp(/^(?:[-+]i|[-+][0-7]+#*(?:\/[0-7]+#*)?i|[-+]?[0-7]+#*(?:\/[0-7]+#*)?@[-+]?[0-7]+#*(?:\/[0-7]+#*)?|[-+]?[0-7]+#*(?:\/[0-7]+#*)?[-+](?:[0-7]+#*(?:\/[0-7]+#*)?)?i|[-+]?[0-7]+#*(?:\/[0-7]+#*)?)(?=[()\s;"]|$)/i),I=new RegExp(/^(?:[-+]i|[-+][\da-f]+#*(?:\/[\da-f]+#*)?i|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?@[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?[-+](?:[\da-f]+#*(?:\/[\da-f]+#*)?)?i|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?)(?=[()\s;"]|$)/i),R=new RegExp(/^(?:[-+]i|[-+](?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)i|[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)@[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)|[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)[-+](?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)?i|(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*))(?=[()\s;"]|$)/i);function B(e){return e.match(M)}function $(e){return e.match(Q)}function u(e,n){return n===!0&&e.backUp(1),e.match(R)}function O(e){return e.match(I)}function y(e,n){for(var i,t=!1;(i=e.next())!=null;){if(i==n.token&&!t){n.state.mode=!1;break}t=!t&&i=="\\"}}const U={name:"scheme",startState:function(){return{indentStack:null,indentation:0,mode:!1,sExprComment:!1,sExprQuote:!1}},token:function(e,n){if(n.indentStack==null&&e.sol()&&(n.indentation=e.indentation()),e.eatSpace())return null;var i=null;switch(n.mode){case"string":y(e,{token:'"',state:n}),i=g;break;case"symbol":y(e,{token:"|",state:n}),i=x;break;case"comment":for(var t,p=!1;(t=e.next())!=null;){if(t=="#"&&p){n.mode=!1;break}p=t=="|"}i=a;break;case"s-expr-comment":if(n.mode=!1,e.peek()=="("||e.peek()=="[")n.sExprComment=0;else{e.eatWhile(/[^\s\(\)\[\]]/),i=a;break}default:var r=e.next();if(r=='"')n.mode="string",i=g;else if(r=="'")e.peek()=="("||e.peek()=="["?(typeof n.sExprQuote!="number"&&(n.sExprQuote=0),i=c):(e.eatWhile(/[\w_\-!$%&*+\.\/:<=>?@\^~]/),i=c);else if(r=="|")n.mode="symbol",i=x;else if(r=="#")if(e.eat("|"))n.mode="comment",i=a;else if(e.eat(/[tf]/i))i=c;else if(e.eat(";"))n.mode="s-expr-comment",i=a;else{var l=null,o=!1,m=!0;e.eat(/[ei]/i)?o=!0:e.backUp(1),e.match(/^#b/i)?l=B:e.match(/^#o/i)?l=$:e.match(/^#x/i)?l=O:e.match(/^#d/i)?l=u:e.match(/^[-+0-9.]/,!1)?(m=!1,l=u):o||e.eat("#"),l!=null&&(m&&!o&&e.match(/^#[ei]/i),l(e)&&(i=b))}else if(/^[-+0-9.]/.test(r)&&u(e,!0))i=b;else if(r==";")e.skipToEnd(),i=a;else if(r=="("||r=="["){for(var d="",f=e.column(),h;(h=e.eat(/[^\s\(\[\;\)\]]/))!=null;)d+=h;d.length>0&&q.propertyIsEnumerable(d)?s(n,f+S,r):(e.eatSpace(),e.eol()||e.peek()==";"?s(n,f+1,r):s(n,f+e.current().length,r)),e.backUp(e.current().length-1),typeof n.sExprComment=="number"&&n.sExprComment++,typeof n.sExprQuote=="number"&&n.sExprQuote++,i=v}else r==")"||r=="]"?(i=v,n.indentStack!=null&&n.indentStack.type==(r==")"?"(":"[")&&(N(n),typeof n.sExprComment=="number"&&--n.sExprComment==0&&(i=a,n.sExprComment=!1),typeof n.sExprQuote=="number"&&--n.sExprQuote==0&&(i=c,n.sExprQuote=!1))):(e.eatWhile(/[\w_\-!$%&*+\.\/:<=>?@\^~]/),k&&k.propertyIsEnumerable(e.current())?i=E:i="variable")}return typeof n.sExprComment=="number"?a:typeof n.sExprQuote=="number"?c:i},indent:function(e){return e.indentStack==null?e.indentation:e.indentStack.indent},languageData:{closeBrackets:{brackets:["(","[","{",'"']},commentTokens:{line:";;"}}};export{U as scheme};
