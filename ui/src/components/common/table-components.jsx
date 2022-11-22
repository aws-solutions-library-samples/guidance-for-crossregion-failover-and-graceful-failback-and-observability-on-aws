// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import {Box, Button, Header, Link, SpaceBetween} from "@cloudscape-design/components";
import React from "react";
import {getHeaderCounterText, getServerHeaderCounterText} from "../../common/tableCounterStrings";
import {InfoLink} from "./links";

export const TableHeader = props => {
  return (
      <Header
          variant={props.variant}
          counter={getCounter(props)}
          info={
            props.updateTools && <InfoLink onFollow={props.updateTools} ariaLabel={`Information about ${props.title}.`} />
          }
          description={props.description}
          actions={props.actionButtons}
      >
        {props.title}
      </Header>
  );
};

function getCounter(props) {
  if (props.counter) {
    return props.counter;
  }
  if (!props.totalItems) {
    return null;
  }
  if (props.serverSide) {
    return getServerHeaderCounterText(props.totalItems, props.selectedItems);
  }
  return getHeaderCounterText(props.totalItems, props.selectedItems);
}

export const TableEmptyState = ({ resourceName }) => (
    <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
      <SpaceBetween size="xxs">
        <div>
          <b>No {resourceName.toLowerCase()}s</b>
          <Box variant="p" color="inherit">
            No {resourceName.toLowerCase()}s associated with this resource.
          </Box>
        </div>
        <Button>Create {resourceName.toLowerCase()}</Button>
      </SpaceBetween>
    </Box>
);

export const TableNoMatchState = props => (
    <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
      <SpaceBetween size="xxs">
        <div>
          <b>No matches</b>
          <Box variant="p" color="inherit">
            We can't find a match.
          </Box>
        </div>
        <Button onClick={props.onClearFilter}>Clear filter</Button>
      </SpaceBetween>
    </Box>
);

export const CounterLink = ({ children }) => {
  return (
      <Link variant="awsui-value-large" href="#">
        {children}
      </Link>
  );
};