// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import React, { useState } from 'react';
import {AppLayout, BreadcrumbGroup, ContentLayout, HelpPanel} from '@cloudscape-design/components';
import { Button, Form, Header, SpaceBetween } from '@cloudscape-design/components';
import { Navigation } from '../common/navigation';
import { Notifications } from '../common/notifications';
import { appLayoutLabels } from '../../common/labels';
import '../../styles/form.scss';
import {InfoLink} from "../common/links";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Box from "@cloudscape-design/components/box";
import {useSelector} from "react-redux";
import {ReduxRoot} from "../../interfaces";
import {useHistory} from "react-router-dom";
import {createRemittance, deleteRemittance, updateRemittance} from "../../data";

export const resourcesBreadcrumbs = [
  {
    text: 'Remittance Processing',
    href: '/Remittances',
  },
  {
    text: 'Delete Remittance',
    href: '/DeleteRemittance',
  },
];

export const Breadcrumbs = () => (
    <BreadcrumbGroup items={resourcesBreadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const ToolsContent =  [
  <HelpPanel
      header={<h2>Remittance</h2>}
      footer={
        <>
        </>
      }
  >
    <p>
      Delete a remittance.
    </p>
  </HelpPanel>,
  <HelpPanel
      header={<h2>Sender's Name</h2>}
      footer={
        <>
        </>
      }
  >
    <p>
      Enter Sender's Full Name.
    </p>
  </HelpPanel>,
  <HelpPanel
      header={<h2>Sender's Bank Name</h2>}
      footer={
        <>
        </>
      }
  >
    <p>
      Enter Sender's Bank Name.
    </p>
  </HelpPanel>,
  <HelpPanel
      header={<h2>Sender's Bank Account</h2>}
      footer={
        <>
        </>
      }
  >
    <p>
      Enter Sender's Bank Account.
    </p>
  </HelpPanel>,
  <HelpPanel
      header={<h2>Receiver's Name</h2>}
      footer={
        <>
        </>
      }
  >
    <p>
      Enter Receiver's Full Name.
    </p>
  </HelpPanel>,
  <HelpPanel
      header={<h2>Receiver's Bank Name</h2>}
      footer={
        <>
        </>
      }
  >
    <p>
      Enter Receiver's Bank Name.
    </p>
  </HelpPanel>,
  <HelpPanel
      header={<h2>Receiver's Bank Account</h2>}
      footer={
        <>
        </>
      }
  >
    <p>
      Enter Receiver's Bank Account.
    </p>
  </HelpPanel>,
  <HelpPanel
      header={<h2>Remittance Amount</h2>}
      footer={
        <>
        </>
      }
  >
    <p>
      Enter Remittance Amount.
    </p>
  </HelpPanel>
]

export function FormHeader({ updateTools }) {
  return (
      <Header
          variant="h1"
          info={
            <InfoLink
                id="form-main-info-link"
                onFollow={() => updateTools(0)}
                ariaLabel={'Information about how to create a remittance.'}
            />
          }
          description="Delete a remittance."
      >
        Delete remittance
      </Header>
  );
}

export function FormContent({ updateTools }) {

  const token = useSelector( (state:ReduxRoot) => {
    return state.reducerState.token
  });

  const remittance = useSelector( (state:ReduxRoot) => {
    return state.reducerState.remittance
  });

  const [id, setId] = useState(remittance.id);
  const [senderName, setSenderName] = useState(remittance.senderName);
  const [senderBank, setSenderBank] = useState(remittance.senderBank);
  const [senderAccount, setSenderAccount] = useState(remittance.senderAccount);
  const [receiverName, setReceiverName] = useState(remittance.receiverName);
  const [receiverBank, setReceiverBank] = useState(remittance.receiverBank);
  const [receiverAccount, setReceiverAccount] = useState(remittance.receiverAccount);
  const [amount, setAmount] = useState(remittance.amount);

  const [senderNameError, setSenderNameError] = useState('');
  const [senderBankError, setSenderBankError] = useState('');
  const [senderAccountError, setSenderAccountError] = useState('');
  const [receiverNameError, setReceiverNameError] = useState('');
  const [receiverBankError, setReceiverBankError] = useState('');
  const [receiverAccountError, setReceiverAccountError] = useState('');
  const [amountError, setAmountError] = useState('');

  const history = useHistory();

  const onDeleteRemittance = async () => {

    try {

      senderName===""?setSenderNameError("You must specify the sender's name."):setSenderNameError("");
      senderBank===""?setSenderBankError("You must specify the sender's bank name."):setSenderBankError("")
      senderAccount===""?setSenderAccountError("You must specify the sender's bank account."):setSenderAccountError("")
      receiverName===""?setReceiverNameError("You must specify the receiver's name."):setReceiverNameError("")
      receiverBank===""?setReceiverBankError("You must specify the receiver's bank name."):setReceiverBankError("")
      receiverAccount===""?setReceiverAccountError("You must specify the receiver's bank account."):setReceiverAccountError("")
      amount===""?setAmountError("You must specify the remittance amount."):setAmountError("")

      if (senderNameError==="" && senderBankError==="" && senderAccountError==="" && receiverNameError==="" && receiverBankError==="" && receiverAccountError==="" && amountError==="") {

        await deleteRemittance(token, id);
        await Promise.resolve();

        history.push("/Remittances");
      }
    }
    catch (err) {
      console.log("Got Error Message: " + err.toString());
    }
  }

  const onCancel = async () => {

    history.push("/Remittances");
  }

  return (
      <form onSubmit={event => event.preventDefault()}>
        <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={onDeleteRemittance} variant="primary">Delete remittance</Button>
              </SpaceBetween>
            }
            errorText={""}
            errorIconAriaLabel="Error"
        >
          <SpaceBetween size="l">
            <Container
                id="origin-panel"
                className="custom-screenshot-hide"
                header={<Header variant="h2">Remittance</Header>}
            >
              <div>
                <Box margin={{ top: 's', bottom: 's' }} padding={{ top: 's', bottom: 's', horizontal: 'xl' }}>
                </Box>
              </div>

              <SpaceBetween size="l">

                <FormField
                    label="Sender's name"
                    info={
                      <InfoLink
                          id="path-info-link"
                          onFollow={() => updateTools(1)}
                          ariaLabel={"Sender's name."}
                      />
                    }
                    errorText={senderNameError}
                    i18nStrings={{ errorIconAriaLabel: 'Error' }}
                >
                  <Input
                      ariaRequired={true}
                      type='text'
                      disabled={true}
                      value={senderName}
                      onChange={event => setSenderName(event.detail.value)}
                      onBlur={event => senderName===""?setSenderNameError("You must specify the sender's name."):setSenderNameError("")}
                  />
                </FormField>

                <FormField
                    label="Sender's bank name"
                    info={
                      <InfoLink
                          id="path-info-link"
                          onFollow={() => updateTools(2)}
                          ariaLabel={"Sender's bank name."}
                      />
                    }
                    errorText={senderBankError}
                    i18nStrings={{ errorIconAriaLabel: 'Error' }}
                >
                  <Input
                      ariaRequired={true}
                      type='text'
                      disabled={true}
                      value={senderBank}
                      onChange={event => setSenderBank(event.detail.value)}
                      onBlur={event => senderBank===""?setSenderBankError("You must specify the sender's bank name."):setSenderBankError("")}
                  />
                </FormField>

                <FormField
                    label="Sender's bank account"
                    info={
                      <InfoLink
                          id="path-info-link"
                          onFollow={() => updateTools(3)}
                          ariaLabel={"Sender's bank account."}
                      />
                    }
                    errorText={senderAccountError}
                    i18nStrings={{ errorIconAriaLabel: 'Error' }}
                >
                  <Input
                      ariaRequired={true}
                      // type='number'
                      disabled={true}
                      value={senderAccount}
                      onChange={event => setSenderAccount(event.detail.value)}
                      onBlur={event => senderAccount===""?setSenderAccountError("You must specify the sender's bank account."):setSenderAccountError("")}
                  />
                </FormField>

                <FormField
                    label="Receiver's name"
                    info={
                      <InfoLink
                          id="path-info-link"
                          onFollow={() => updateTools(4)}
                          ariaLabel={'Receiver name.'}
                      />
                    }
                    errorText={receiverNameError}
                    i18nStrings={{ errorIconAriaLabel: 'Error' }}
                >
                  <Input
                      ariaRequired={true}
                      type='text'
                      disabled={true}
                      value={receiverName}
                      onChange={event => setReceiverName(event.detail.value)}
                      onBlur={event => receiverName===""?setReceiverNameError("You must specify the receiver's name."):setReceiverNameError("")}
                  />
                </FormField>

                <FormField
                    label="Receiver's bank name"
                    info={
                      <InfoLink
                          id="path-info-link"
                          onFollow={() => updateTools(5)}
                          ariaLabel={"Receiver's bank name."}
                      />
                    }
                    errorText={receiverBankError}
                    i18nStrings={{ errorIconAriaLabel: 'Error' }}
                >
                  <Input
                      ariaRequired={true}
                      type='text'
                      disabled={true}
                      value={receiverBank}
                      onChange={event => setReceiverBank(event.detail.value)}
                      onBlur={event => receiverBank===""?setReceiverBankError("You must specify the receiver's bank name."):setReceiverBankError("")}
                  />
                </FormField>

                <FormField
                    label="Receiver's bank account"
                    info={
                      <InfoLink
                          id="path-info-link"
                          onFollow={() => updateTools(6)}
                          ariaLabel={"Receiver's bank account."}
                      />
                    }
                    errorText={receiverAccountError}
                    i18nStrings={{ errorIconAriaLabel: 'Error' }}
                >
                  <Input
                      ariaRequired={true}
                      // type='number'
                      disabled={true}
                      value={receiverAccount}
                      onChange={event => setReceiverAccount(event.detail.value)}
                      onBlur={event => receiverAccount===""?setReceiverAccountError("You must specify the receiver's bank account."):setReceiverAccountError("")}
                  />
                </FormField>

                <FormField
                    label="Remittance amount"
                    info={
                      <InfoLink
                          id="path-info-link"
                          onFollow={() => updateTools(7)}
                          ariaLabel={"Remittance amount."}
                      />
                    }
                    errorText={amountError}
                    i18nStrings={{ errorIconAriaLabel: 'Error' }}
                >
                  <Input
                      ariaRequired={true}
                      type='number'
                      disabled={true}
                      value={amount}
                      onChange={event => setAmount(event.detail.value)}
                      onBlur={event => amount===""?setAmountError("You must specify the remittance amount."):setAmountError("")}
                  />
                </FormField>

              </SpaceBetween>
            </Container>
          </SpaceBetween>
        </Form>
      </form>
  );
}

function DeleteRemittanceForm() {

  const [toolsIndex, setToolsIndex] = useState(0);
  const [toolsOpen, setToolsOpen] = useState(false);

  const updateTools = index => {
    setToolsIndex(index);
    setToolsOpen(true);
  };

  return (
      <AppLayout
          contentType="form"
          content={
            <ContentLayout header={<FormHeader updateTools={updateTools} />}>
              <FormContent updateTools={updateTools} />
            </ContentLayout>
          }
          headerSelector="#header"
          breadcrumbs={<Breadcrumbs />}
          navigation={<Navigation activeHref="/Remittances" />}
          tools={ToolsContent[toolsIndex]}
          toolsOpen={toolsOpen}
          onToolsChange={({ detail }) => setToolsOpen(detail.open)}
          ariaLabels={appLayoutLabels}
          notifications={<Notifications />}
      />
  );
}

export default DeleteRemittanceForm;