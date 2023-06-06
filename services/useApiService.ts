import {useCallback} from 'react';

import {useFetch} from '@/hooks/useFetch';
import {ChatBody} from "@/types/chat";

export interface GetModelsRequestProps {
    key: string;
}

export const useApiService = (accessToken: string | null) => {
    const fetchService = useFetch();
//   const sendChatRequest = useCallback(
//   (body: ChatBody, signal?: AbortSignal): Promise<Response> => {
//     // ...
//   },
//   [fetchService],
// );
//
    const sendChatRequest = useCallback(
        (body: ChatBody, signal?: AbortSignal): Promise<Response> => {
            // const pythonBackendURL = `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/chat`;
            const pythonBackendURL = `https://gptweet.rolebotics.com/api/chat`;
            console.log('posting chat request to endpoint', pythonBackendURL)
            return fetchService.post<Response>(pythonBackendURL, {
                body: body,
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && {Authorization: `Bearer ${accessToken}`}),
                },
                signal,
            });
        },
        [fetchService, accessToken],
    );

    // const getModels = useCallback(
    // 	(
    // 		params: GetManagementRoutineInstanceDetailedParams,
    // 		signal?: AbortSignal
    // 	) => {
    // 		return fetchService.get<GetManagementRoutineInstanceDetailed>(
    // 			`/v1/ManagementRoutines/${params.managementRoutineId}/instances/${params.instanceId
    // 			}?sensorGroupIds=${params.sensorGroupId ?? ''}`,
    // 			{
    // 				signal,
    // 			}
    // 		);
    // 	},
    // 	[fetchService]
    // );

    // const getModels = useCallback(
    //   (params: GetModelsRequestProps, signal?: AbortSignal) => {
    //     return fetchService.post<GetModelsRequestProps>(`/api/models`, {
    //       body: { key: params.key },
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       signal,
    //     });
    //   },
    //   [fetchService],
    // );

    return {
        // getModels,
        sendChatRequest
    };
};

export default useApiService;
