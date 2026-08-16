-- Edge Journal sample data
-- Run supabase/schema.sql first.
-- Change this email to the account that should receive the sample trades.

create or replace function pg_temp.edge_sample_chart_image(
  image_stage text,
  chart_pair text,
  chart_result text,
  trade_number integer,
  accent_color text
)
returns text
language plpgsql
as $$
declare
  chart_svg text;
begin
  chart_svg := format(
    $svg$<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#f4f4f5"/><path d="M80 735H820M80 615H820M80 495H820M80 375H820M80 255H820M80 135H820" stroke="#d4d4d8" stroke-width="3" stroke-dasharray="10 12"/><path d="M80 735V90M210 735V90M340 735V90M470 735V90M600 735V90M730 735V90" stroke="#e4e4e7" stroke-width="2"/><rect x="610" y="178" width="128" height="430" fill="#a1a1aa" opacity="0.35"/><path d="M96 675 C180 604 216 636 286 552 S418 492 478 420 585 354 642 260 735 228 804 158" fill="none" stroke="#111827" stroke-width="9" stroke-linecap="round"/><path d="M96 675 C180 604 216 636 286 552 S418 492 478 420 585 354 642 260 735 228 804 158" fill="none" stroke="%5$s" stroke-width="3" stroke-linecap="round"/><line x1="130" y1="590" x2="760" y2="590" stroke="#111827" stroke-width="4"/><line x1="130" y1="316" x2="760" y2="316" stroke="#111827" stroke-width="4"/><rect x="330" y="402" width="34" height="100" rx="4" fill="#ef4444"/><line x1="347" y1="360" x2="347" y2="535" stroke="#ef4444" stroke-width="8"/><rect x="435" y="330" width="34" height="130" rx="4" fill="#fafafa" stroke="#111827" stroke-width="3"/><line x1="452" y1="290" x2="452" y2="490" stroke="#111827" stroke-width="8"/><rect x="548" y="282" width="34" height="126" rx="4" fill="%5$s"/><line x1="565" y1="238" x2="565" y2="448" stroke="%5$s" stroke-width="8"/><rect x="660" y="214" width="34" height="148" rx="4" fill="#fafafa" stroke="#111827" stroke-width="3"/><line x1="677" y1="165" x2="677" y2="404" stroke="#111827" stroke-width="8"/><rect x="54" y="46" width="320" height="86" rx="18" fill="#111827"/><text x="80" y="99" fill="#fff" font-family="Arial, sans-serif" font-size="34" font-weight="700">%1$s SETUP</text><rect x="54" y="772" width="792" height="82" rx="18" fill="#111827"/><text x="82" y="824" fill="#fff" font-family="Arial, sans-serif" font-size="32" font-weight="700">%2$s  -  %3$s  -  Trade %4$s</text></svg>$svg$,
    image_stage,
    chart_pair,
    chart_result,
    trade_number,
    accent_color
  );

  return 'data:image/svg+xml;base64,' || encode(convert_to(chart_svg, 'UTF8'), 'base64');
end;
$$;

do $$
declare
  target_email text := 'mohanmehean@gmail.com';
  target_user uuid;
  next_cycle_number integer;
  target_backtest_cycle text;
begin
  select id into target_user
  from auth.users
  where lower(email) = lower(target_email)
  limit 1;

  if target_user is null then
    raise exception 'No Supabase auth user found for %. Create/login the user first, then run this file again.', target_email;
  end if;

  delete from public.trades
  where user_id = target_user
    and notes like 'Sample seed:%';

  select coalesce(max(coalesce(nullif(substring(coalesce(backtest_cycle, 'Journey 1') from '\d+'), '')::integer, 1)), 0) + 1
  into next_cycle_number
  from public.trades
  where user_id = target_user
    and area = 'Backtesting';

  target_backtest_cycle := 'Journey ' || next_cycle_number;

  insert into public.trades (
    user_id,
    pair,
    direction,
    entry,
    stop_loss,
    take_profit,
    risk_amount,
    reward_amount,
    rr,
    result,
    profit_loss,
    r_multiple,
    trade_date,
    purging_time,
    session,
    strategy_names,
    area,
    backtest_cycle,
    strategy_points,
    emotion,
    mistake,
    notes,
    screenshot_url,
    before_screenshot_url,
    after_screenshot_url
  )
  select
    target_user,
    case when i % 3 = 0 then 'XAUUSD' when i % 3 = 1 then 'EUR/USD' else 'GBP/USD' end,
    case when i % 2 = 0 then 'Buy' else 'Sell' end::public.trade_direction,
    case
      when i % 3 = 0 then 2300 + (i * 0.85)
      when i % 3 = 1 then 1.0700 + (i * 0.0007)
      else 1.2500 + (i * 0.0009)
    end,
    case
      when i % 2 = 0 and i % 3 = 0 then 2295 + (i * 0.85)
      when i % 2 = 1 and i % 3 = 0 then 2305 + (i * 0.85)
      when i % 2 = 0 and i % 3 = 1 then 1.0650 + (i * 0.0007)
      when i % 2 = 1 and i % 3 = 1 then 1.0750 + (i * 0.0007)
      when i % 2 = 0 then 1.2450 + (i * 0.0009)
      else 1.2550 + (i * 0.0009)
    end,
    case
      when i % 2 = 0 and i % 3 = 0 then 2315 + (i * 0.85)
      when i % 2 = 1 and i % 3 = 0 then 2285 + (i * 0.85)
      when i % 2 = 0 and i % 3 = 1 then 1.0850 + (i * 0.0007)
      when i % 2 = 1 and i % 3 = 1 then 1.0550 + (i * 0.0007)
      when i % 2 = 0 then 1.2650 + (i * 0.0009)
      else 1.2350 + (i * 0.0009)
    end,
    100 + ((i % 5) * 10),
    (100 + ((i % 5) * 10)) * 3,
    3,
    case
      when i % 20 in (0, 5) then 'BE'
      when i % 10 in (4, 9) then 'Partial'
      when i % 10 in (1, 2, 3, 6, 7, 8) then 'TP'
      else 'SL'
    end::public.trade_result,
    case
      when i % 20 in (0, 5) then 0
      when i % 10 in (4, 9) then (100 + ((i % 5) * 10)) * 1.5
      when i % 10 in (1, 2, 3, 6, 7, 8) then (100 + ((i % 5) * 10)) * 3
      else -(100 + ((i % 5) * 10))
    end,
    case
      when i % 20 in (0, 5) then 0
      when i % 10 in (4, 9) then 1.5
      when i % 10 in (1, 2, 3, 6, 7, 8) then 3
      else -1
    end,
    current_date - (100 - i),
    make_time(case when i % 3 = 0 then 3 when i % 3 = 1 then 9 else 14 end, (i * 7) % 60, 0),
    case when i % 3 = 0 then 'Asia' when i % 3 = 1 then 'London' else 'New York' end::public.trading_session,
    case
      when i % 8 = 0 then array['SMT', 'Model #1']
      when i % 8 = 1 then array['KIL']
      when i % 8 = 2 then array['LQ']
      when i % 8 = 3 then array['IRL to ERL']
      when i % 8 = 4 then array['ERL to IRL']
      when i % 8 = 5 then array['OF']
      when i % 8 = 6 then array['2SMT']
      else array['Model #1']
    end,
    'Backtesting',
    target_backtest_cycle,
    array['Major liquidity marked', '1H TSQ confirmed', '3RR target respected'],
    case when i % 4 = 0 then 'Patient' when i % 4 = 1 then 'Confident' when i % 4 = 2 then 'Calm' else 'Rushed' end,
    case when i % 10 in (7, 8) then 'Late entry' when i % 10 = 9 then 'Moved stop' else 'None' end,
    'Sample seed: Backtesting trade #' || i || ' for 100-trade model validation.',
    '',
    pg_temp.edge_sample_chart_image(
      'BEFORE',
      case when i % 3 = 0 then 'XAUUSD' when i % 3 = 1 then 'EUR/USD' else 'GBP/USD' end,
      case when i % 20 in (0, 5) then 'BE' when i % 10 in (4, 9) then 'Partial' when i % 10 in (1, 2, 3, 6, 7, 8) then 'TP' else 'SL' end,
      i,
      '#2563eb'
    ),
    pg_temp.edge_sample_chart_image(
      'AFTER',
      case when i % 3 = 0 then 'XAUUSD' when i % 3 = 1 then 'EUR/USD' else 'GBP/USD' end,
      case when i % 20 in (0, 5) then 'BE' when i % 10 in (4, 9) then 'Partial' when i % 10 in (1, 2, 3, 6, 7, 8) then 'TP' else 'SL' end,
      i,
      case when i % 20 in (0, 5) then '#64748b' when i % 10 in (4, 9) then '#f59e0b' when i % 10 in (1, 2, 3, 6, 7, 8) then '#16a34a' else '#ef1018' end
    )
  from generate_series(1, 100) as g(i);

  insert into public.trades (
    user_id,
    pair,
    direction,
    entry,
    stop_loss,
    take_profit,
    risk_amount,
    reward_amount,
    rr,
    result,
    profit_loss,
    r_multiple,
    trade_date,
    purging_time,
    session,
    strategy_names,
    area,
    backtest_cycle,
    strategy_points,
    emotion,
    mistake,
    notes,
    screenshot_url,
    before_screenshot_url,
    after_screenshot_url
  )
  select
    target_user,
    case when i % 3 = 0 then 'XAUUSD' when i % 3 = 1 then 'EUR/USD' else 'GBP/USD' end,
    case when i % 2 = 0 then 'Buy' else 'Sell' end::public.trade_direction,
    case
      when i % 3 = 0 then 2400 + (i * 0.9)
      when i % 3 = 1 then 1.1100 + (i * 0.0008)
      else 1.2800 + (i * 0.0008)
    end,
    case
      when i % 2 = 0 and i % 3 = 0 then 2395 + (i * 0.9)
      when i % 2 = 1 and i % 3 = 0 then 2405 + (i * 0.9)
      when i % 2 = 0 and i % 3 = 1 then 1.1050 + (i * 0.0008)
      when i % 2 = 1 and i % 3 = 1 then 1.1150 + (i * 0.0008)
      when i % 2 = 0 then 1.2750 + (i * 0.0008)
      else 1.2850 + (i * 0.0008)
    end,
    case
      when i % 2 = 0 and i % 3 = 0 then 2415 + (i * 0.9)
      when i % 2 = 1 and i % 3 = 0 then 2385 + (i * 0.9)
      when i % 2 = 0 and i % 3 = 1 then 1.1250 + (i * 0.0008)
      when i % 2 = 1 and i % 3 = 1 then 1.0950 + (i * 0.0008)
      when i % 2 = 0 then 1.2950 + (i * 0.0008)
      else 1.2650 + (i * 0.0008)
    end,
    100,
    300,
    3,
    case
      when i = 6 then 'BE'
      when i = 10 then 'Partial'
      when i in (1, 2, 3, 4, 7, 8) then 'TP'
      else 'SL'
    end::public.trade_result,
    case
      when i = 6 then 0
      when i = 10 then 150
      when i in (1, 2, 3, 4, 7, 8) then 300
      else -100
    end,
    case
      when i = 6 then 0
      when i = 10 then 1.5
      when i in (1, 2, 3, 4, 7, 8) then 3
      else -1
    end,
    current_date - (10 - i),
    make_time(case when i % 3 = 0 then 3 when i % 3 = 1 then 9 else 14 end, (i * 11) % 60, 0),
    case when i % 3 = 0 then 'Asia' when i % 3 = 1 then 'London' else 'New York' end::public.trading_session,
    case when i % 2 = 0 then array['SMT', 'Model #1'] else array['KIL', 'LQ'] end,
    'Forward Testing',
    target_backtest_cycle,
    array['Same model as backtest', 'No rule changes', '3RR target planned'],
    case when i % 3 = 0 then 'Focused' when i % 3 = 1 then 'Patient' else 'Calm' end,
    case when i in (5, 9) then 'Early entry' else 'None' end,
    'Sample seed: Forward Testing trade #' || i || ' for 10-trade live-sim validation.',
    '',
    pg_temp.edge_sample_chart_image(
      'BEFORE',
      case when i % 3 = 0 then 'XAUUSD' when i % 3 = 1 then 'EUR/USD' else 'GBP/USD' end,
      case when i = 6 then 'BE' when i = 10 then 'Partial' when i in (1, 2, 3, 4, 7, 8) then 'TP' else 'SL' end,
      i,
      '#2563eb'
    ),
    pg_temp.edge_sample_chart_image(
      'AFTER',
      case when i % 3 = 0 then 'XAUUSD' when i % 3 = 1 then 'EUR/USD' else 'GBP/USD' end,
      case when i = 6 then 'BE' when i = 10 then 'Partial' when i in (1, 2, 3, 4, 7, 8) then 'TP' else 'SL' end,
      i,
      case when i = 6 then '#64748b' when i = 10 then '#f59e0b' when i in (1, 2, 3, 4, 7, 8) then '#16a34a' else '#ef1018' end
    )
  from generate_series(1, 10) as g(i);
end $$;
