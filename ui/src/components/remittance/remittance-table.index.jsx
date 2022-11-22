// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from 'react';
import PropertyFilter from "@cloudscape-design/components/property-filter";
import { useCollection } from '@cloudscape-design/collection-hooks';
import { COLUMN_DEFINITIONS, FILTERING_PROPERTIES, PROPERTY_FILTERING_I18N_CONSTANTS, DEFAULT_PREFERENCES, Preferences } from './remittance-table-config';
import {
  BreadcrumbGroup,
  Button,
  HelpPanel,
  Pagination,
  SpaceBetween,
  Table
} from '@cloudscape-design/components';
import { CustomAppLayout } from '../common/app-layout';
import { Navigation } from '../common/navigation';
import { Notifications } from '../common/notifications';
import { TableEmptyState, TableHeader, TableNoMatchState } from '../common/table-components';

import {paginationLabels, distributionSelectionLabels} from '../../common/labels';
import { getFilterCounterText } from '../../common/tableCounterStrings';
import '../../styles/base.scss';
import { useColumnWidths } from '../common/use-column-widths';
import { useLocalStorage } from '../../common/localStorage';
import {executeRunbook, getRemittances} from "../../data";
import {IRemittance, ReduxRoot} from "../../interfaces";

import { useDispatch, useSelector } from "react-redux";
import { storeRemittanceAction } from "../../redux/actions";
import {useHistory} from "react-router-dom";

export const resourcesBreadcrumbs = [
  {
    text: 'Remittance Processing',
    href: '/Remittances',
  }
];

export const Breadcrumbs = () => (
    <BreadcrumbGroup items={resourcesBreadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const FullPageHeader = ({
                                 resourceName = 'Remittances',
                                 createButtonText = 'Create remittance',
                                 ...props
                               }) => {
  const isOnlyOneSelected = props.selectedItems.length === 1;

  const history = useHistory();

  const token = useSelector( (state:ReduxRoot) => {
    return state.reducerState.token
  });

  const onViewDetail = () => {
    history.push("/Remittance");
  }

  const onCreateRemittance = () => {
    history.push("/CreateRemittance");
  }

  const onUpdateRemittance = () => {
    history.push("/UpdateRemittance");
  }

  const onDeleteRemittance = () => {
    history.push("/DeleteRemittance");
  }

  const onExecuteRunbook = async () => {

    try {

      await executeRunbook(token, "us-east-1", "FailoverRunbook");

      await Promise.resolve();

    }
    catch (err) {
      console.log("Got Error Message: " + err.toString());
    }
  }

  return (
      <TableHeader
          variant="awsui-h1-sticky"
          title={resourceName}
          actionButtons={
            <SpaceBetween size="xs" direction="horizontal">
              <Button onClick={onViewDetail} disabled={!isOnlyOneSelected}>View details</Button>
              <Button onClick={onUpdateRemittance} disabled={!isOnlyOneSelected}>Update</Button>
              <Button onClick={onDeleteRemittance} disabled={!isOnlyOneSelected}>Delete</Button>
              <Button onClick={onCreateRemittance}> {createButtonText}</Button>
              <Button onClick={onExecuteRunbook} variant="primary">Failover</Button>
            </SpaceBetween>
          }
          {...props}
      />
  );
};

export const ToolsContent = () => (
    <HelpPanel
        header={<h2>Remittances</h2>}
        footer={
          <>
          </>
        }
    >
      <p>
        View all your remittances.
      </p>
    </HelpPanel>
);

function TableContent({updateTools }) {

  const dispatch = useDispatch();

  const token = useSelector( (state:ReduxRoot) => {
    return state.reducerState.token
  });

  const [remittances, setRemittances] = useState([]);
  const [selectedRemittances, setSelectedRemittances] = useState([]);

  const [columnDefinitions, saveWidths] = useColumnWidths('React-Table-Widths', COLUMN_DEFINITIONS);
  const [preferences, setPreferences] = useLocalStorage('React-DistributionsTable-Preferences', DEFAULT_PREFERENCES);

  const { items, actions, filteredItemsCount, collectionProps, paginationProps, propertyFilterProps } = useCollection(
      remittances,
    {
      propertyFiltering: {
        filteringProperties: FILTERING_PROPERTIES,
        empty: <TableEmptyState resourceName="Remittances" />,
        noMatch: (
            <TableNoMatchState
                onClearFilter={() => {
                  actions.setPropertyFiltering({ tokens: [], operation: 'and' });
                }}
            />
        ),
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
      selection: {},
    }
  );

  const getAllRemittances = async () => {

    try {

      await getRemittances(token).then(
          (result: IRemittance[]) => {
            if (typeof result != 'string') {
              setRemittances(result);
            }
          });

      await Promise.resolve();

    }
    catch (err) {
      console.log("Got Error Message: " + err.toString());
    }
  }

  useEffect( () => {

    getAllRemittances().then(() => console.log("getRemittances() completed."));
  }, []);

  const selectRemittance = (remittance: IRemittance) => {
    dispatch(storeRemittanceAction(remittance?remittance: {}));
  }

  return (
    <Table
      {...collectionProps}
      items={items}
      columnDefinitions={columnDefinitions}
      visibleColumns={preferences.visibleContent}
      ariaLabels={distributionSelectionLabels}
      selectionType="single"
      variant="full-page"
      stickyHeader={true}
      resizableColumns={true}
      wrapLines={preferences.wrapLines}
      onColumnWidthsChange={saveWidths}
      header={
        <FullPageHeader
          selectedItems={selectedRemittances}
          totalItems={remittances}
          updateTools={updateTools}
          serverSide={false}
        />
      }
      loadingText="Loading remittances"
      filter={
        <PropertyFilter
          i18nStrings={PROPERTY_FILTERING_I18N_CONSTANTS}
          {...propertyFilterProps}
          countText={getFilterCounterText(filteredItemsCount)}
          expandToViewport={true}
        />
      }
      pagination={<Pagination {...paginationProps} ariaLabels={paginationLabels} />}
      preferences={<Preferences preferences={preferences} setPreferences={setPreferences} />}
      selectedItems={selectedRemittances}
      onSelectionChange={evt => {setSelectedRemittances(evt.detail.selectedItems); selectRemittance(evt.detail.selectedItems[0])}}
    />
  );
}

function RemittanceTableView() {
  const [columnDefinitions, saveWidths] = useColumnWidths('React-TableServerSide-Widths', COLUMN_DEFINITIONS);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <CustomAppLayout
      navigation={<Navigation activeHref="/Remittances" />}
      notifications={<Notifications successNotification={false} />}
      breadcrumbs={<Breadcrumbs />}
      content={
        <TableContent
          columnDefinitions={columnDefinitions}
          saveWidths={saveWidths}
          updateTools={() => setToolsOpen(true)}
        />
      }
      contentType="table"
      tools={<ToolsContent />}
      toolsOpen={toolsOpen}
      onToolsChange={({ detail}) => setToolsOpen(detail.open)}
      stickyNotifications={true}
    />
  );
}

export default RemittanceTableView;