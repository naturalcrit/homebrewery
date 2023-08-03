const getWidth = function(){
    if(window.innerWidth < 600){
        this.setState({
            narrowScreen : true
        });
    };
    window.addEventListener('resize', this.handleResize);

}

export default getWidth;