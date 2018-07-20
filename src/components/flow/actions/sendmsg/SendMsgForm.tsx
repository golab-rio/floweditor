import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { HeaderStyle } from '~/components/dialog/Dialog';
import Flipper, { FlipperProps } from '~/components/flipper/Flipper';
import * as styles from '~/components/flow/actions/action/Action.scss';
import * as localStyles from '~/components/flow/actions/sendmsg/SendMsgForm.scss';
import { SendMsgFormHelper } from '~/components/flow/actions/sendmsg/SendMsgFormHelper';
import CheckboxElement from '~/components/form/checkbox/CheckboxElement';
import TaggingElement from '~/components/form/select/tags/TaggingElement';
import TextInputElement, { Count } from '~/components/form/textinput/TextInputElement';
import { ButtonSet } from '~/components/modal/Modal';
import { back } from '~/components/modal/Modal.scss';
import { UpdateLocalizations } from '~/components/nodeeditor/NodeEditor';
import TypeList from '~/components/nodeeditor/TypeList';
import { Type } from '~/config/typeConfigs';
import { SendMsg } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { mergeForm, NodeEditorSettings, SendMsgFormState } from '~/store/nodeEditor';
import { validate, validateMaxOfTen, validateRequired } from '~/store/validators';

const MAX_REPLIES = 10;

export interface SendMsgFormProps {
    // localization settings
    translating: boolean;
    language: Asset;

    // action details
    nodeSettings: NodeEditorSettings;
    formHelper: SendMsgFormHelper;
    typeConfig: Type;

    // update handlers
    updateLocalizations(languageCode: string, localizations: any[]): UpdateLocalizations;
    updateAction(action: SendMsg): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

export default class SendMsgForm extends React.Component<SendMsgFormProps, SendMsgFormState> {
    constructor(props: SendMsgFormProps) {
        super(props);
        this.state = this.props.formHelper.initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^handle/, /^on/]
        });
    }

    private handleUpdateForm(updates: Partial<SendMsgFormState>): boolean {
        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handleUpdateMessage(value: string): boolean {
        const validators = [];
        if (!this.props.translating) {
            validators.push(validateRequired);
        }

        return this.handleUpdateForm({
            text: validate('Message', value, validators)
        });
    }

    public handleUpdateQuickReplies(value: string[]): boolean {
        return this.handleUpdateForm({
            quickReplies: validate('Quick Replies', value, [validateMaxOfTen])
        });
    }

    public handleUpdateSendAll(sendAll: boolean): void {
        this.handleUpdateForm({ sendAll });
    }

    public handleCheckValidReply(value: string): boolean {
        return true;
    }

    public handleValidReplyPrompt(value: string): string {
        return `New Reply "${value}"`;
    }

    private handleSave(): void {
        if (this.state.valid) {
            if (this.props.translating) {
                const { text, quickReplies } = this.state;

                this.props.updateLocalizations(this.props.language.id, [
                    {
                        uuid: this.props.nodeSettings.originalAction.uuid,
                        translations: {
                            text: text.value,
                            quick_replies: quickReplies.value
                        }
                    }
                ]);
            } else {
                this.props.updateAction(
                    this.props.formHelper.stateToAction(
                        this.props.nodeSettings.originalAction.uuid,
                        this.state
                    )
                );
            }

            // notify our modal we are done
            this.props.onClose(false);
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public renderEdit(): FlipperProps {
        return {
            front: (
                <Dialog
                    title={this.props.typeConfig.name}
                    headerClass={this.props.typeConfig.type}
                    buttons={this.getButtons()}
                >
                    <TypeList
                        __className=""
                        initialType={this.props.typeConfig}
                        onChange={this.props.onTypeChange}
                    />
                    <TextInputElement
                        name="Message"
                        showLabel={false}
                        count={Count.SMS}
                        onChange={this.handleUpdateMessage}
                        entry={this.state.text}
                        autocomplete={true}
                        focus={true}
                        textarea={true}
                    />
                </Dialog>
            ),

            back: (
                <Dialog
                    title={this.props.typeConfig.name}
                    subtitle="Advanced Settings"
                    headerStyle={HeaderStyle.BARBER}
                    headerClass={this.props.typeConfig.type}
                    headerIcon="fe-cog"
                >
                    <p>Quick Replies are made into buttons for supported channels</p>
                    <TaggingElement
                        name="Replies"
                        placeholder="Quick Replies"
                        prompt="Enter a Quick Reply"
                        onChange={this.handleUpdateQuickReplies}
                        onCheckValid={this.handleCheckValidReply}
                        onValidPrompt={this.handleValidReplyPrompt}
                        entry={this.state.quickReplies}
                    />
                    <CheckboxElement
                        name="All Destinations"
                        title="All Destinations"
                        labelClassName={localStyles.checkbox}
                        checked={this.state.sendAll}
                        description="Send a message to all destinations known for this contact."
                        onChange={this.handleUpdateSendAll}
                    />
                </Dialog>
            )
        };
    }

    public renderTranslate(): FlipperProps {
        return {
            front: (
                <Dialog
                    title={this.props.typeConfig.name}
                    headerClass={this.props.typeConfig.type}
                    buttons={this.getButtons()}
                >
                    <div data-spec="translation-container">
                        <div data-spec="text-to-translate" className={styles.translate_from}>
                            {(this.props.nodeSettings.originalAction as SendMsg).text}
                        </div>
                    </div>

                    <TextInputElement
                        name="Message"
                        showLabel={false}
                        count={Count.SMS}
                        onChange={this.handleUpdateMessage}
                        entry={this.state.text}
                        placeholder={`${this.props.language.name} Translation`}
                        autocomplete={true}
                        focus={true}
                        textarea={true}
                    />
                </Dialog>
            ),

            back: (
                <Dialog
                    title={this.props.typeConfig.name}
                    subtitle="Advanced Settings"
                    headerStyle={HeaderStyle.BARBER}
                    headerClass={this.props.typeConfig.type}
                    headerIcon="fe-cog"
                >
                    <p>Enter any {this.props.language.name} Quick Replies</p>
                    <TaggingElement
                        name="Replies"
                        placeholder="Quick Replies"
                        prompt="Enter a Quick Reply"
                        onChange={this.handleUpdateQuickReplies}
                        onCheckValid={this.handleCheckValidReply}
                        onValidPrompt={this.handleValidReplyPrompt}
                        entry={this.state.quickReplies}
                    />
                </Dialog>
            )
        };
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return (
                <Flipper
                    {...this.renderTranslate()}
                    flipped={this.props.nodeSettings.showAdvanced}
                />
            );
        } else {
            return (
                <Flipper {...this.renderEdit()} flipped={this.props.nodeSettings.showAdvanced} />
            );
        }
    }
}
