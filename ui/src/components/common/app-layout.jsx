// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import { AppLayout } from "@cloudscape-design/components";
import { appLayoutLabels } from "../../common/labels";
import React from "react";


export function CustomAppLayout(props) {
  return (
      <AppLayout
          {...props}
          headerSelector="#header"
          ariaLabels={appLayoutLabels}
          onNavigationChange={event => {
            if (props.onNavigationChange) {
              props.onNavigationChange(event);
            }
          }}
          onToolsChange={event => {
            if (props.onToolsChange) {
              props.onToolsChange(event);
            }
          }}
      />
  );
}