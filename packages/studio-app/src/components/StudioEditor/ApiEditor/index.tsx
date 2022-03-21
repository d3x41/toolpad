import * as React from 'react';
import { useQuery } from 'react-query';
import { Alert, Box, Button, LinearProgress, Stack, Toolbar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { NodeId } from '../../../types';
import dataSources from '../../../studioDataSources/client';
import client from '../../../api';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomLoader';
import useDebounced from '../../../utils/useDebounced';
import NodeNameEditor from '../NodeNameEditor';
import NotFoundEditor from '../NotFoundEditor';
import { ConnectionSelect } from '../HierarchyExplorer/CreateStudioApiDialog';

interface ApiEditorContentProps<Q> {
  appId: string;
  className?: string;
  apiNode: studioDom.StudioApiNode<Q>;
}

function ApiEditorContent<Q>({ appId, className, apiNode }: ApiEditorContentProps<Q>) {
  const domApi = useDomApi();
  const dom = useDom();

  const [apiQuery, setApiQuery] = React.useState<Q>(apiNode.attributes.query.value);
  const savedQuery = React.useRef(apiNode.attributes.query.value);

  const conectionId = apiNode.attributes.connectionId.value as NodeId;
  const connection = studioDom.getMaybeNode(dom, conectionId, 'connection');
  const dataSourceName = apiNode.attributes.dataSource.value;
  const dataSource = dataSources[dataSourceName] || null;

  const previewApi: studioDom.StudioApiNode<Q> = React.useMemo(() => {
    return {
      ...apiNode,
      attributes: { ...apiNode.attributes, query: studioDom.createConst(apiQuery) },
    };
  }, [apiNode, apiQuery]);

  const debouncedPreviewApi = useDebounced(previewApi, 250);

  const previewQuery = useQuery(['api', debouncedPreviewApi], async () =>
    client.query.execApi(appId, debouncedPreviewApi, {}),
  );

  const queryEditorApi = React.useMemo(() => {
    return {
      fetchPrivate: async (query: any) =>
        client.query.dataSourceFetchPrivate(appId, conectionId, query),
    };
  }, [appId, conectionId]);

  const handleConnectionChange = React.useCallback(
    (newConnectionId) => {
      if (apiNode) {
        domApi.setNodeNamespacedProp(
          apiNode,
          'attributes',
          'connectionId',
          studioDom.createConst(newConnectionId),
        );
      }
    },
    [apiNode, domApi],
  );

  if (!dataSource) {
    return (
      <NotFoundEditor className={className} message={`DataSource "${dataSourceName}" not found`} />
    );
  }

  const previewIsInvalid: boolean = !connection && !previewQuery.isError;

  return (
    <Box className={className} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', px: 3, pt: 3 }}
      >
        <ConnectionSelect
          dataSource={dataSourceName}
          value={connection?.id ?? null}
          onChange={handleConnectionChange}
        />
        <Toolbar disableGutters>
          <Button
            onClick={() => {
              (Object.keys(apiQuery) as (keyof Q)[]).forEach((propName) => {
                if (typeof propName !== 'string' || !apiQuery[propName]) {
                  return;
                }
                domApi.setNodeNamespacedProp(
                  apiNode,
                  'attributes',
                  'query',
                  studioDom.createConst(apiQuery),
                );
              });
              savedQuery.current = apiQuery;
            }}
            disabled={savedQuery.current === apiQuery}
          >
            Update
          </Button>
        </Toolbar>
        <Stack spacing={2}>
          <NodeNameEditor node={apiNode} />
          <dataSource.QueryEditor
            api={queryEditorApi}
            // TODO: Add disabled mode to QueryEditor
            // disabled={!connection}
            value={apiQuery}
            onChange={(newApiQuery) => setApiQuery(newApiQuery)}
          />
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', borderTop: 1, borderColor: 'divider' }}>
        {previewQuery.isLoading || (previewIsInvalid && previewQuery.isFetching) ? (
          <LinearProgress />
        ) : null}
        {previewQuery.isError ? (
          <Alert severity="error">{(previewQuery.error as Error).message}</Alert>
        ) : null}
        {!previewIsInvalid && previewQuery.isSuccess ? (
          <pre>{JSON.stringify(previewQuery.data, null, 2)}</pre>
        ) : null}
      </Box>
    </Box>
  );
}

interface ApiEditorProps {
  appId: string;
  className?: string;
}

export default function ApiEditor({ appId, className }: ApiEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const apiNode = studioDom.getMaybeNode(dom, nodeId as NodeId, 'api');
  return apiNode ? (
    <ApiEditorContent className={className} key={nodeId} appId={appId} apiNode={apiNode} />
  ) : (
    <NotFoundEditor className={className} message={`Non-existing api "${nodeId}"`} />
  );
}
