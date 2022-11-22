// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import React from 'react';
import {useSelector} from "react-redux";
import {ReduxRoot} from "../../interfaces";
import {CustomAppLayout} from "../common/app-layout";
import {Navigation} from "../common/navigation";
import {BreadcrumbGroup, Header, HelpPanel} from "@cloudscape-design/components";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";

export default class RemittanceDetailView extends React.Component {

  render() {
    return (
        <CustomAppLayout
            navigation={<Navigation activeHref="/Remittances"/>}
            navigationOpen={true}
            breadcrumbs={<Breadcrumbs />}
            content={<RemittanceDetail />}
            contentType="default"
            tools={<ToolsContent />}
            toolsHide={false}
            // labels={appLayoutNavigationLabels}
        />

    );
  }
}

export const resourcesBreadcrumbs = [
  {
    text: 'Remittance Processing',
    href: '/Remittances',
  },
  {
    text: 'Remittance',
    href: '/Remittance',
  },
];

export const Breadcrumbs = () => (
    <BreadcrumbGroup items={resourcesBreadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const ToolsContent = () => (
    <HelpPanel
        header={<h2>Remittance</h2>}
        footer={
          <>
          </>
        }
    >
      <p>
        View details of a remittance.
      </p>
    </HelpPanel>
);

function RemittanceDetail (props: any) {

  const remittance = useSelector( (state:ReduxRoot) => {
    return state.reducerState.remittance
  });

  return (
      <div>

        <div>
          <Box margin={{ top: 's', bottom: 's' }} padding={{ top: 's', bottom: 's', horizontal: 'xl' }}>
          </Box>
        </div>


        <Box margin={{ top: 's', bottom: 's' }} padding={{ top: 'xxl', bottom: 'xxl', horizontal: 'xl' }}>

          <Container
              id="origin-panel"
              className="custom-screenshot-hide"
              header={<Header variant="h2">Remittance</Header>}
          >
            <SpaceBetween size="xl">

              <ColumnLayout columns={3} variant="text-grid">

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">ID</Box>
                    <div>{remittance.id}</div>
                  </div>
                </div>

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">Amount</Box>
                    <div>
                      {remittance.amount}
                    </div>
                  </div>
                </div>

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">Creation Timestamp</Box>
                    <div>
                      {remittance.creationTimestamp}
                    </div>
                  </div>
                </div>

              </ColumnLayout>

              <ColumnLayout columns={3} variant="text-grid">

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">Sender Name</Box>
                    <div>{remittance.senderName}</div>
                  </div>
                </div>

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">Sender Bank</Box>
                    <div>{remittance.senderBank}</div>
                  </div>
                </div>

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">Sender Account</Box>
                    <div>{remittance.senderAccount}</div>
                  </div>
                </div>

              </ColumnLayout>

              <ColumnLayout columns={3} variant="text-grid">

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">Receiver Name</Box>
                    <div>
                      {remittance.receiverName}
                    </div>
                  </div>
                </div>

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">Receiver Bank</Box>
                    <div>
                      {remittance.receiverBank}
                    </div>
                  </div>
                </div>

                <div className="awsui-util-spacing-v-s">
                  <div>
                    <Box variant="awsui-key-label">Receiver Account</Box>
                    <div>
                      {remittance.receiverAccount}
                    </div>
                  </div>
                </div>

              </ColumnLayout>

            </SpaceBetween>

          </Container>

        </Box>

      </div>
  );
}


