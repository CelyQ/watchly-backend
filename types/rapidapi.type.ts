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

export type RapidAPIIMDBTitleGetBaseResponseData = {
  data: {
    title: {
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
        attributes: Array<{
          id: string;
          text: string;
        }>;
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
    };
  };
};

export type RapidAPIIMDBOverviewResponseData = {
  data: {
    title: {
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
        attributes: Array<{
          id: string;
          text: string;
        }>;
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
      meta: {
        id: string;
        restrictions: null;
      };
      productionStatus: {
        __typename: string;
        announcements: null;
        currentProductionStage: {
          id: string;
          text: string;
        };
        productionStatusHistory: Array<{
          comment: {
            text: string;
          } | null;
          date: string;
          status: {
            id: string;
            text: string;
          };
        }>;
      };
      canRate: {
        isRatable: boolean;
      };
      ratingsSummary: {
        aggregateRating: number;
        voteCount: number;
      };
      interests: {
        edges: Array<{
          node: {
            __typename: string;
            id: string;
            primaryImage: {
              __typename: string;
              id: string;
              url: string;
              height: number;
              width: number;
              type: string;
              caption: {
                plainText: string;
              };
              copyright: string | null;
              createdBy: string | null;
              source: {
                text: string | null;
                attributionUrl: string | null;
                banner: null;
              };
              names: Array<{
                __typename: string;
                id: string;
                nameText: {
                  text: string;
                };
                primaryImage: {
                  __typename: string;
                  id: string;
                  url: string;
                  height: number;
                  width: number;
                };
                akas: {
                  edges: Array<{
                    node: {
                      text: string;
                    };
                  }>;
                };
              }>;
              titles: Array<{
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
                };
              }>;
              countries: Array<unknown>;
              languages: Array<unknown>;
            };
            description: {
              value: {
                plainText: string;
              };
            };
            primaryText: {
              __typename: string;
              id: string;
              text: string;
            };
            secondaryText: {
              __typename: string;
              id: string;
              text: string;
            };
          };
        }>;
      };
      reviews: {
        total: number;
      };
      metacritic: {
        url: string;
        metascore: {
          score: number;
          reviewCount: number;
        };
      };
      externalLinks: {
        total: number;
      };
      series: null;
      plot: {
        plotText: {
          plainText: string;
        };
      };
      certificate: {
        __typename: string;
        id: string;
        rating: string;
        ratingsBody: {
          id: string;
          text: string;
        };
        ratingReason: string;
        country: {
          id: string;
        };
      };
      runtime: {
        seconds: number;
      };
      episodes: null;
      engagementStatistics: {
        watchlistStatistics: {
          displayableCount: {
            text: string;
          };
        };
      };
    };
  };
};
