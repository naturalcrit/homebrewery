var test =`

<div class >

<a>




</div>


 </a>


<span> </span>

<div> Hellow !!! </div></div></div></div></div></div>




</a>


`;

var markdown = require('./markdown.js');

console.log(markdown.validate(test));