import React from 'react';
import './newDocumentForm.less';

const sizes = [
	// ISO A-series (converted from mm)
	{ id: 'A3', width: 11.7, height: 16.5 }, // 297 × 420 mm
	{ id: 'A4', width: 8.27, height: 11.69 }, // 210 × 297 mm
	{ id: 'A5', width: 5.83, height: 8.27 }, // 148 × 210 mm
	{ id: 'A6', width: 4.13, height: 5.83 }, // 105 × 148 mm

	// US & common book trim sizes
	{ id: 'US_Letter', width: 8.5, height: 11 },
	{ id: 'Trade_Paperback', width: 6, height: 9 },
	{ id: 'Digest', width: 5.5, height: 8.5 },
	{ id: 'Pocket_Book', width: 4, height: 6 },
	{ id: 'Square_8_5', width: 8.5, height: 8.5 },
	{ id: 'Large_Square', width: 10, height: 10 },
];
const cmPerInch = 2.54;
const pxPerInch = 96;

const showAs = (val, unit)=>{
	switch (unit) {
	case 'cm':
		return Math.round(val*cmPerInch);
	case 'px':
		return Math.round(val*pxPerInch);
	default:
		return val;
	}
};

const unit = 'cm';

export function NewDocumentForm() {
	return (
		<>
			<nav className='popupTabs'>
				<button>templates</button>
				<button>import</button>
				<button>clone</button>
			</nav>
			<div className='content'>
				<div className='templates'>
					{sizes.map((size)=>(
						<div className='template' key={size.id} onClick={()=>{}}>
							<div
								className='image'
								style={{ height: '100px', width: `${(size.width / size.height) * 100}px` }}>
								<span>{showAs(size.width, unit)}{unit} by {showAs(size.height, unit)}{unit}</span>
							</div>
							<span>{size.id.replaceAll('_', ' ')}</span>
						</div>
					))}
				</div>
				<div className='metadataPanel'>
					<div className='field title'>
						<label>title</label>
						<input type='text' defaultValue='' placeholder='title' className='title' onChange={(e)=>{}} />
					</div>
					<div className='field description'>
						<label>description</label>
						<textarea className='description'onChange={(e)=>{}} />
					</div>
					<button
						id='newButton'
						onClick={()=>{

						}}
					>
					Create new
						<i
							className={'fa-solid fa-file'}
						/>
					</button>
				</div>
			</div>
		</>
	);
}
