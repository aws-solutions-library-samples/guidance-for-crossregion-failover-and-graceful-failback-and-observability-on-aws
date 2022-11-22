// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import {SideNavigation} from "@cloudscape-design/components";
import React from "react";
import {useHistory} from "react-router-dom";

export const navHeader = { text: 'X-Region Failover', href: '/' };
export const navItems = [
  {
    type: 'section',
    text: 'Remittance Processing',
    items: [
      { type: 'link', text: 'Remittances', href: '/Remittances' },
    ],
  }
];

const defaultOnFollowHandler = ev => {
  console.log("Text : " + ev.detail.text)

  // ev.preventDefault();
};

export function Navigation({
                             activeHref,
                             header = navHeader,
                             items = navItems,
                             onFollowHandler = defaultOnFollowHandler,
                           }) {
  const history = useHistory();

  const defaultOnFollowHandler = ev => {
    ev.preventDefault();
    history.push("/" + ev.detail.text.replace(" ", ""));
  };

  return <SideNavigation items={items} header={header} activeHref={activeHref} onFollow={defaultOnFollowHandler} />;
}