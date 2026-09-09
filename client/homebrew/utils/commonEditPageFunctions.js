export default function useCommonEditPageFunctions(dependencies) {
    const {
        setError,
        setThemeBundle,
        HTMLErrors,
        setHTMLErrors,
        setCurrentBrew,
        useLocalStorage,
        BREWKEY,
        STYLEKEY,
        SNIPKEY,
        METAKEY,
        fetchThemeBundle,
        hbfm
        } = dependencies;

    const handleBrewChange = (field)=>(value, subfield)=>{	//'text', 'style', 'snippets', 'metadata'
        if(subfield == 'renderer' || subfield == 'theme')
            fetchThemeBundle(setError, setThemeBundle, value.renderer, value.theme);

        //If there are HTML errors, run the validator on every change to give quick feedback
        if(HTMLErrors.length && (field == 'text' || field == 'snippets'))
            setHTMLErrors(hbfm.validate(value));

        if(field == 'metadata') setCurrentBrew((prev)=>({ ...prev, ...value }));
        else                    setCurrentBrew((prev)=>({ ...prev, [field]: value }));

        if(useLocalStorage) {
            if(field == 'text')     localStorage.setItem(BREWKEY, value);
            if(field == 'style')    localStorage.setItem(STYLEKEY, value);
            if(field == 'snippets') localStorage.setItem(SNIPKEY, value);
            if(field == 'metadata') localStorage.setItem(METAKEY, JSON.stringify({
                renderer : value.renderer,
                theme    : value.theme,
                lang     : value.lang
            }));
        }
    };

    return {
        handleBrewChange
    }
}