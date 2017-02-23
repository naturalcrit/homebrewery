
const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const Menubar = React.createClass({
	getDefaultProps: function() {
		return {
			view : '',
			onViewChange : ()=>{},
			onSnippetInject : ()=>{},
		};
	},
	render: function(){
		return <div className='menubar'>

			<div className='editors'>
				<div className={cx('code', {selected : this.props.view == 'code'})}
					 onClick={this.props.onViewChange.bind(null, 'code')}>
					<i className='fa fa-beer' />
				</div>
				<div className={cx('style', {selected : this.props.view == 'style'})}
					 onClick={this.props.onViewChange.bind(null, 'style')}>
					<i className='fa fa-paint-brush' />
				</div>
				<div className={cx('meta', {selected : this.props.view == 'meta'})}
					 onClick={this.props.onViewChange.bind(null, 'meta')}>
					<i className='fa fa-bars' />
				</div>
			</div>
		</div>
	}
});

module.exports = Menubar;
