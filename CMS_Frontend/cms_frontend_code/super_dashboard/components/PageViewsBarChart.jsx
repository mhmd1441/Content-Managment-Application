import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import { get_dashboard_visits } from "@/services/api.js";

export default function PageViewsBarChart() {
  const theme = useTheme();

  const colors = {
    super: theme.palette.primary.main, 
    business: theme.palette.success.main, 
    user: theme.palette.warning.main,
  };

  const [labels, setLabels] = React.useState([]);
  const [series, setSeries] = React.useState({
    super: [],
    business: [],
    user: [],
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await get_dashboard_visits(6);
        if (!mounted) return;
        setLabels(data.labels);
        setSeries(data.series);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Page visits
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <Typography variant="h4" component="p">
              1.3M
            </Typography>
            <Chip size="small" color="error" label="-8%" />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Visits by dashboard for the last 6 months
          </Typography>
        </Stack>

        <BarChart
          loading={loading}
          borderRadius={8}
          xAxis={[
            {
              scaleType: "band",
              categoryGapRatio: 0.4,
              data: labels,
              height: 24,
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: 50,
              tickMinStep: 5,
            },
          ]}
          series={[
            {
              id: "super",
              label: "Super dashboard",
              data: series.super,
              color: colors.super,
            },
            {
              id: "business",
              label: "Business dashboard",
              data: series.business,
              color: colors.business,
            },
            {
              id: "user",
              label: "User dashboard",
              data: series.user,
              color: colors.user,
            },
          ]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
        />
      </CardContent>
    </Card>
  );
}
