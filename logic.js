(function(g){const D=[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]];
function moves(n,b,i){const r=Math.floor(i/n),c=i%n,o=[];for(const[a,d]of D){const R=r+a,C=c+d;if(R>=0&&C>=0&&R<n&&C<n&&!b[R*n+C])o.push(R*n+C)}return o}
function hint(n,b,cur){const m=moves(n,b,cur);if(!m.length)return -1;let best=-1,bd=99;for(const x of m){b[x]=1;const d=moves(n,b,x).length;b[x]=0;if(d<bd){bd=d;best=x}}return best}
g.KL={moves,hint}; if(typeof module!=="undefined")module.exports=g.KL})(typeof window!=="undefined"?window:globalThis);
