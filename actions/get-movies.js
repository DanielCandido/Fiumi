const Constants = require("../constants");
const axios = require("axios");

const getMetadata = async (ids) => {
  let idsParam = "";
  for (let i = 0; i < ids.length; i++) {
    if (i < ids.length - 1) {
      idsParam += `ids=${ids[i]}&`;
    } else [(idsParam += `ids=${ids[i]}`)];
  }

  const options = {
    method: "GET",
    url: `${Constants.API_URL}/title/get-meta-data?${idsParam}`,
    params: { ids: ids, region: "BR" },
    headers: {
      "X-RapidAPI-Key": Constants.API_TOKEN,
      "X-RapidAPI-Host": Constants.API_HOST,
    },
  };

  const response = await axios.request(options);

  return response.data;
};

const findItem = async (itemName) => {
  try {
    const options = {
      method: "GET",
      url: `${Constants.API_URL}/title/v2/find`,
      params: {
        title: itemName,
        titleType: "movie,tvSeries,short,tvEpisode,tvMiniSeries,tvMovie",
        limit: "6",
        sortArg: "moviemeter,asc",
      },
      headers: {
        "X-RapidAPI-Key": Constants.API_TOKEN,
        "X-RapidAPI-Host": Constants.API_HOST,
      },
    };

    const response = await axios.request(options);

    if (
      response.data &&
      response.data.results &&
      Array.isArray(response.data.results)
    ) {
      const mapper = response.data.results.map((item) => ({
        name: item.title,
        id: item.id.replace("/title/", "").replace("/", ""),
        type: item.titleType,
        year: item.year,
        image: item.image ? item.image.url : "",
      }));

      const ids = mapper.map((item) => item.id);

      const metaDatas = await getMetadata(ids);

      const data = mapper.map((x) => {
        const metaData = metaDatas[x.id];
        const waysToWatch =
          metaData && metaData.waysToWatch ? metaData.waysToWatch : null;

        if (waysToWatch && waysToWatch.optionGroups) {
          const options = waysToWatch.optionGroups.map((x) =>
            x.watchOptions.map((e) => e.primaryText)
          );

          let waysToWatchOptions = "";

          options.forEach((element) => {
            waysToWatchOptions += element.map((e) => `${e},`);
          });

          waysToWatchOptions = waysToWatchOptions.replace(/,,/g, ",");

          return {
            ...x,
            waysToWatch:
              waysToWatchOptions.length === 0
                ? "Sem informações"
                : waysToWatchOptions,
          };
        } else {
          return { ...x, waysToWatch: "Sem informações" };
        }
      });

      return data;
    }

    return null;
  } catch (err) {
    console.log(err);

    return null;
  }
};

module.exports = findItem;
