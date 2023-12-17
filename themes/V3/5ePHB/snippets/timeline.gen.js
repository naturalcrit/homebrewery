const _ = require('lodash');
const dedent = require('dedent-tabs').default;

module.exports = {
	horizontal : ()=>{
		return dedent `{{timeline,--start:2012,--end:2026,--resolution:40px,--space:3em

            {{event,--date:2015 Scott Tolksdorf <br> creates the Homebrewery}}
                
            {{event,reverse,--date:2019 Scott retires from the project <br> Calculuschild inherits THB}}
                
            {{event,--date:2022 v3 is released}}
                
            {{event,reverse,--date:2024 v4 <u>may</u> be released}}
                
            {{range,--dateStart:2012;--dateEnd:2015,background:red}}
            {{range,--dateStart:2020;--dateEnd:2021,background:gold}}
            {{range,--dateStart:2021;--dateEnd:2023,background:green}}
                
            }}
            
            {{legend
            ##### Legend
            {{ref,background:red}} Time without THB  
            {{ref,background:gold}} Covid lockdown  
            {{ref,background:green}} Kaiburr releases templates
            }}\n\n`;
	},
	vertical : ()=>{
		return dedent `{{legend
            ##### Legend
            {{ref,background:red}} Time without THB  
            {{ref,background:gold}} Covid lockdown  
            {{ref,background:green}} Kaiburr releases templates
            }}
            
            {{timeline,--start:2012,--end:2026,--resolution:40px,--space:3em,vertical

            {{event,--date:2015 Scott Tolksdorf <br> creates the Homebrewery}}
                
            {{event,reverse,--date:2019 Scott retires from the project <br> Calculuschild inherits THB}}
                
            {{event,--date:2022 v3 is released}}
                
            {{event,reverse,--date:2024 v4 <u>may</u> be released}}
                
            {{range,--dateStart:2012;--dateEnd:2015,background:red}}
            {{range,--dateStart:2020;--dateEnd:2021,background:gold}}
            {{range,--dateStart:2021;--dateEnd:2023,background:green}}
                
            }}\n\n`;
	}
};


()=>{

};
