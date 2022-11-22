// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import {Link} from "@cloudscape-design/components";
import {externalLinkProps} from "../../common/labels";
import React from "react";

export const InfoLink = ({ id, onFollow, ariaLabel }) => (
    <Link variant="info" id={id} onFollow={onFollow} ariaLabel={ariaLabel}>
      Info
    </Link>
);

// a special case of external link, to be used within a link group, where all of them are external
// and we do not repeat the icon
export const ExternalLinkItem = ({ href, text }) => (
    <Link href={href} ariaLabel={`${text} ${externalLinkProps.externalIconAriaLabel}`} target="_blank">
      {text}
    </Link>
);