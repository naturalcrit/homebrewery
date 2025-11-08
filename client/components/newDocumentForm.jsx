import React from "react";
import './newDocumentForm.less';

export function NewDocumentForm() {

  return <>
    <nav>
      <button>templates</button>
      <button>import</button>
      <button>clone</button>
    </nav>
    <div className="content">
<div className="templates">
      <div className="template a4"><div className="image"></div><span>A4</span></div>
      <div className="template a5"><div className="image"></div><span>A5</span></div>
      <div className="template a4"><div className="image"></div><span>A4</span></div>
      <div className="template a5"><div className="image"></div><span>A5</span></div>
      <div className="template a4"><div className="image"></div><span>A4</span></div>
      <div className="template a5"><div className="image"></div><span>A5</span></div>
    </div>
    <div className="metadataPanel">
      <div className="fieldGroup">
        <label>title</label>
						<input type='text'
							defaultValue=''
							placeholder='title'
							className='title'
							onChange={(e)=>{}} />
      </div>
    </div>
    </div>
    
  </>

}
