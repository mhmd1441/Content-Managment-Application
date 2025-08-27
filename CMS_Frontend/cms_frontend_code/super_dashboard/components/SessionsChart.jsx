import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { LineChart } from "@mui/x-charts/LineChart";
import { analytics_sessions_by_role } from "@/services/api";

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}
AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default function SessionsChart({
  days = 30,
  parentPath = "/super_dashboard",
}) {
  const theme = useTheme();
  const [labels, setLabels] = React.useState([]);
  const [sa, setSa] = React.useState([]); // super admin
  const [ba, setBa] = React.useState([]); // business admin
  const [us, setUs] = React.useState([]); // user
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await analytics_sessions_by_role({
          days,
          parent_path: parentPath,
        });
        if (!mounted) return;
        setLabels(data.labels || []);
        setSa(data.series?.super_admin || []);
        setBa(data.series?.business_admin || []);
        setUs(data.series?.user || []);
        setTotal(data.totals?.all || 0);
      } catch (err) {
        console.error("analytics fetch failed", err?.response?.data || err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [days, parentPath]);

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Sessions
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {total.toLocaleString()}
            </Typography>
            <Chip size="small" color="success" label="+35%" />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Sessions per day for the last {days} days
          </Typography>
        </Stack>

        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: "point",
              data: labels,
              tickInterval: (index, i) => (i + 1) % 5 === 0,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: "direct", // keep id for your CSS gradient
              label: "Super Admin", // new label
              showMark: false,
              curve: "linear",
              stack: "total",
              area: true,
              stackOrder: "ascending",
              data: sa,
            },
            {
              id: "referral",
              label: "Business Admin",
              showMark: false,
              curve: "linear",
              stack: "total",
              area: true,
              stackOrder: "ascending",
              data: ba,
            },
            {
              id: "organic",
              label: "User",
              showMark: false,
              curve: "linear",
              stack: "total",
              stackOrder: "ascending",
              data: us,
              area: true,
            },
          ]}
          height={250}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          sx={{
            "& .MuiAreaElement-series-organic": { fill: "url('#organic')" },
            "& .MuiAreaElement-series-referral": { fill: "url('#referral')" },
            "& .MuiAreaElement-series-direct": { fill: "url('#direct')" },
          }}
          hideLegend
        >
          <AreaGradient color={theme.palette.primary.dark} id="organic" />
          <AreaGradient color={theme.palette.primary.main} id="referral" />
          <AreaGradient color={theme.palette.primary.light} id="direct" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
