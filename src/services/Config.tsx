import {TypeConfig, Operator} from '../interfaces';
import {AddToGroup, AddToGroupForm} from '../components/actions/AddToGroup';
import {SaveToContact, SaveToContactForm} from '../components/actions/SaveToContact';
import {SetLanguage, SetLanguageForm} from '../components/actions/SetLanguage';
import {SendMessage, SendMessageForm} from '../components/actions/SendMessage';
import {Webhook, WebhookForm} from '../components/actions/Webhook';
import {Missing} from '../components/actions/Missing';
import {SwitchRouterForm} from '../components/routers/SwitchRouter';
import {RandomRouterForm} from '../components/routers/RandomRouter';


export class Config {

    private static singleton: Config = new Config();

    static get(): Config {
        return Config.singleton;
    }

    private constructor() {
        // console.log('init config');
    }

    public typeConfigs: TypeConfig[] = [

        // actions
        {type: "msg", name: "Send Message", description: "Send them a message", form: SendMessageForm, component: SendMessage},
        {type: "add_to_group", name: "Add to Group", description: "Add them to a group", form: AddToGroupForm, component: AddToGroup},
        {type: "save_to_contact", name: "Save to Contact", description: "Update one of their fields", form: SaveToContactForm, component: SaveToContact},
        {type: "set_language", name: "Set Language", description: "Update their language", form: SetLanguageForm, component: SetLanguage},
        {type: "add_label", name: "Add Label", description: "Label the message", component: Missing},
        {type: "email", name: "Send Email", description: "Send an email", component: Missing},
        {type: "set_preferred_channel", name: "Set Preferred Channel", description: "Set their preferred channel", component: Missing},
        {type: "flow", name: "Run another flow", description: "Run another flow", component: Missing},
        
        
        // hybrids
        {type: "webhook", name: "Call Webhook", description: "Call an external service", form: WebhookForm, component: Webhook},

        // routers
        {type: "switch", name: "Wait for Response", description: "Wait for them to respond", form: SwitchRouterForm},
        {type: "random", name: "Random Split", description: "Split them up randomly", form: RandomRouterForm}

    ]

    public getTypeConfig(type: string): TypeConfig {
        for (let config of this.typeConfigs) {
            if (config.type == type) {
                return config;
            }
        }

        console.error("No configuration found for", type);
        return null;
    }

    public operators: Operator[] = [
        { type: "has_any_word", name: "Contains any", verboseName: "has any of the words", operands: 1},
        { type: "has_all_words", name: "Contains all", verboseName: "has all of the words", operands: 1},
        { type: "has_phrase", name: "Contains phrase", verboseName: "has the phrase", operands: 1},
    ]
}

export default Config;