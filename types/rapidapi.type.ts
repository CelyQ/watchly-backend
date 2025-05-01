export type RapidAPIIMDBSearchResponseData = {
  data: {
    mainSearch: {
      edges: Array<{
        node: {
          entity: {
            __typename: string;
            id: string;
            titleText: {
              text: string;
              isOriginalTitle: boolean;
            };
            originalTitleText: {
              text: string;
              isOriginalTitle: boolean;
            };
            releaseYear: {
              __typename: string;
              year: number;
              endYear: number | null;
            };
            releaseDate: {
              __typename: string;
              month: number;
              day: number;
              year: number;
              country: {
                id: string;
              };
              restriction: null;
              attributes: Array<unknown>;
              displayableProperty: {
                qualifiersInMarkdownList: null;
              };
            };
            titleType: {
              __typename: string;
              id: string;
              text: string;
              categories: Array<{
                id: string;
                text: string;
                value: string;
              }>;
              canHaveEpisodes: boolean;
              isEpisode: boolean;
              isSeries: boolean;
              displayableProperty: {
                value: {
                  plainText: string;
                };
              };
            };
            primaryImage: {
              __typename: string;
              id: string;
              url: string;
              height: number;
              width: number;
            } | null;
            episodes: null;
            series: null;
            principalCredits: Array<{
              credits: Array<{
                name: {
                  __typename: string;
                  id: string;
                  nameText: {
                    text: string;
                  };
                  primaryImage: null;
                };
              }>;
            }>;
          };
        };
      }>;
    };
  };
};

export type RapidAPIIMDBSearchResponseDataEntity =
  RapidAPIIMDBSearchResponseData["data"]["mainSearch"]["edges"][0]["node"][
    "entity"
  ];
