// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences} from '@cloudscape-design/components';
import { addColumnSortLabels } from '../../common/labels';

export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'id',
    sortingField: 'id',
    header: 'ID',
    cell: item => item.id,
    minWidth: 100,
  },
  {
    id: 'senderName',
    sortingField: 'senderName',
    header: 'Sender name',
    cell: item => item.senderName,
    minWidth: 150,
  },
  {
    id: 'senderBank',
    sortingField: 'senderBank',
    header: 'Sender bank',
    cell: item => item.senderBank,
    minWidth: 150,
  },
  {
    id: 'senderAccount',
    sortingField: 'senderAccount',
    header: 'Sender account',
    cell: item => item.senderAccount,
    minWidth: 150,
  },
  {
    id: 'receiverName',
    sortingField: 'receiverName',
    header: 'Receiver name',
    cell: item => item.receiverName,
    minWidth: 150,
  },
  {
    id: 'receiverBank',
    sortingField: 'receiverBank',
    header: 'Receiver bank',
    cell: item => item.receiverBank,
    minWidth: 150,
  },
  {
    id: 'receiverAccount',
    sortingField: 'receiverAccount',
    header: 'Receiver account',
    cell: item => item.receiverAccount,
    minWidth: 150,
  },
  {
    id: 'amount',
    sortingField: 'amount',
    header: 'Amount',
    cell: item => item.amount,
    minWidth: 150,
  },
  {
    id: 'creationTimestamp',
    sortingField: 'creationTimestamp',
    header: 'Creation timestamp',
    cell: item => (
        <div>
          {get_date(item.creationTimestamp)}
        </div>
    ),
    minWidth: 150
  },
]);

const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main distribution properties',
    options: [
      { id: 'id', label: 'ID', editable: false },
      { id: 'senderName', label: 'Sender Name' },
      { id: 'senderBank', label: 'Sender Bank' },
      { id: 'senderAccount', label: 'Sender Account' },
      { id: 'receiverName', label: 'Receiver Name' },
      { id: 'receiverBank', label: 'Receiver Bank' },
      { id: 'receiverAccount', label: 'Receiver Account' },
      { id: 'amount', label: 'Amount' },
      { id: 'creationTimestamp', label: 'Creation Timestamp' },
    ],
  },
];

export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 Remittances' },
  { value: 30, label: '30 Remittances' },
  { value: 50, label: '50 Remittances' },
];

export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['id', 'senderName', 'senderBank', 'senderAccount', 'receiverName', 'receiverBank', 'receiverAccount', 'amount', 'creationTimestamp'],
  wrapLines: false,
};

export const FILTERING_PROPERTIES = [
  {
    propertyLabel: 'ID',
    key: 'id',
    groupValuesLabel: 'ID values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Sender name',
    key: 'senderName',
    groupValuesLabel: 'Sender name values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Sender bank',
    key: 'senderBank',
    groupValuesLabel: 'Sender bank values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Sender account',
    key: 'senderAccount',
    groupValuesLabel: 'Sender account values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Receiver name',
    key: 'receiverName',
    groupValuesLabel: 'Receiver name values',
    operators: [':', '!:', '=', '!='],
  },
  { propertyLabel: 'Receiver bank',
    key: 'receiverBank',
    groupValuesLabel: 'Receiver bank values',
    operators: [':', '!:', '=', '!='] },
  {
    propertyLabel: 'Receiver account',
    key: 'receiverAccount',
    groupValuesLabel: 'Receiver account values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Amount',
    key: 'amount',
    groupValuesLabel: 'Amount values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Creation timestamp',
    key: 'creationTimestamp',
    groupValuesLabel: 'Creation timestamp values',
    operators: [':', '!:', '=', '!='],
  }
];

export const PROPERTY_FILTERING_I18N_CONSTANTS = {
  filteringAriaLabel: 'your choice',
  dismissAriaLabel: 'Dismiss',

  filteringPlaceholder: 'Search',
  groupValuesText: 'Values',
  groupPropertiesText: 'Properties',
  operatorsText: 'Operators',

  operationAndText: 'and',
  operationOrText: 'or',

  operatorLessText: 'Less than',
  operatorLessOrEqualText: 'Less than or equal',
  operatorGreaterText: 'Greater than',
  operatorGreaterOrEqualText: 'Greater than or equal',
  operatorContainsText: 'Contains',
  operatorDoesNotContainText: 'Does not contain',
  operatorEqualsText: 'Equals',
  operatorDoesNotEqualText: 'Does not equal',

  editTokenHeader: 'Edit filter',
  propertyText: 'Property',
  operatorText: 'Operator',
  valueText: 'Value',
  cancelActionText: 'Cancel',
  applyActionText: 'Apply',
  allPropertiesLabel: 'All properties',

  tokenLimitShowMore: 'Show more',
  tokenLimitShowFewer: 'Show fewer',
  clearFiltersText: 'Clear filters',
  removeTokenButtonAriaLabel: () => 'Remove token',
  enteredTextLabel: text => `Use: "${text}"`,
};

export const Preferences = ({
  preferences,
  setPreferences,
  disabled,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  visibleContentOptions = VISIBLE_CONTENT_OPTIONS,
}) => (
  <CollectionPreferences
    title="Preferences"
    confirmLabel="Confirm"
    cancelLabel="Cancel"
    disabled={disabled}
    preferences={preferences}
    onConfirm={({ detail }) => setPreferences(detail)}
    pageSizePreference={{
      title: 'Page size',
      options: pageSizeOptions,
    }}
    wrapLinesPreference={{
      label: 'Wrap lines',
      description: 'Check to see all the text and wrap the lines',
    }}
    visibleContentPreference={{
      title: 'Select visible columns',
      options: visibleContentOptions,
    }}
  />
);

function get_date(timestamp) {
  if (timestamp.length > 19) {
    return timestamp.substring(0, 19)
  }
  else {
    return timestamp
  }
}