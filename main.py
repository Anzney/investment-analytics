from data_handlers.cambridge_handler import CambridgeAssociatesHandler
from ai.insights_agent import InvestmentAIAgent
# NOTE: We are still missing the analytics module, so I'm creating a dummy class 
# to allow main.py to run without errors for now.
class PerformanceAnalytics:
    def calculate_portfolio_metrics(self, investments):
        return {
            "total_invested": sum(i.get('contributed', 0) for i in investments),
            "total_nav": sum(i.get('nav', 0) for i in investments),
            "total_distributed": sum(i.get('distributed', 0) for i in investments),
            "portfolio_tvpi": 1.5, # Dummy value
            "portfolio_dpi": 0.5,  # Dummy value
            "top_performers": sorted(investments, key=lambda x: x.get('irr', 0), reverse=True),
            "underperformers": sorted(investments, key=lambda x: x.get('irr', 0))
        }
    def calculate_tvpi(self, dist, nav, contrib):
        if contrib == 0: return 0
        return (dist + nav) / contrib

def run_investment_agent(
    data_source="excel",
    file_path=None,
    deliver_weekly_report=False
):
    """
    Main function to run investment agent
    """
    
    print("🚀 Investment Performance Agent Starting...")
    
    # Load data
    handler = CambridgeAssociatesHandler()
    
    if data_source == "excel" and file_path:
        investments = handler.load_from_excel_export(
            file_path
        )
    else:
        # Sample data for demo
        investments = get_sample_portfolio()
    
    if not investments:
        print("❌ No investment data loaded")
        return
    
    print(f"✅ Loaded {len(investments)} investments")
    
    # Calculate metrics
    analytics = PerformanceAnalytics()
    metrics = analytics.calculate_portfolio_metrics(
        investments
    )
    
    # Get AI insights
    agent = InvestmentAIAgent(investments)
    # We need to monkey patch PerformanceAnalytics onto the agent so it can use it
    agent.analytics = analytics
    
    insights = agent.get_ai_insights(metrics)
    anomalies = agent.detect_anomalies(metrics)
    
    # Print report
    if deliver_weekly_report:
        report = agent.generate_weekly_report()
        print(report)
        # Optionally send via WhatsApp
        # send_whatsapp(report)
    
    # Launch dashboard
    print("\n🌐 Launching dashboard...")
    print("Run: streamlit run delivery/dashboard.py")
    
    return {
        "investments": investments,
        "metrics": metrics,
        "insights": insights,
        "anomalies": anomalies
    }


def get_sample_portfolio():
    """Sample data for demo to him"""
    return [
        {
            "name": "KKR Asian Fund IV",
            "asset_class": "Private Equity",
            "vintage_year": 2019,
            "contributed": 5000000,
            "distributed": 2000000,
            "nav": 7500000,
            "irr": 0.24
        },
        {
            "name": "Sequoia India Growth",
            "asset_class": "Venture Capital",
            "vintage_year": 2020,
            "contributed": 3000000,
            "distributed": 500000,
            "nav": 6000000,
            "irr": 0.35
        },
        {
            "name": "Dubai Real Estate Fund",
            "asset_class": "Real Estate",
            "vintage_year": 2018,
            "contributed": 4000000,
            "distributed": 3000000,
            "nav": 3500000,
            "irr": 0.14
        },
        {
            "name": "Emerging Markets Bond",
            "asset_class": "Fixed Income",
            "vintage_year": 2021,
            "contributed": 2000000,
            "distributed": 800000,
            "nav": 1600000,
            "irr": 0.07
        },
        {
            "name": "Tech Growth Fund III",
            "asset_class": "Private Equity",
            "vintage_year": 2017,
            "contributed": 6000000,
            "distributed": 8000000,
            "nav": 4000000,
            "irr": 0.28
        }
    ]


if __name__ == "__main__":
    result = run_investment_agent(
        data_source="sample",
        deliver_weekly_report=True
    )
