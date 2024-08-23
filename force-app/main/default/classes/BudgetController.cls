public with sharing class BudgetController {
    

    // Wrapper class to return budget data
    public class BudgetData {
        @AuraEnabled public Decimal totalMonthlyIncome;
        @AuraEnabled public Decimal totalFixedExpenses;
        @AuraEnabled public Decimal totalVariableExpenses;
        @AuraEnabled public Decimal totalOneTimeExpenses;
        @AuraEnabled public Decimal netMonthlyCashFlow;

        public BudgetData(Decimal totalMonthlyIncome, Decimal totalFixedExpenses, Decimal totalVariableExpenses, Decimal totalOneTimeExpenses, Decimal netMonthlyCashFlow) {
            this.totalMonthlyIncome = totalMonthlyIncome;
            this.totalFixedExpenses = totalFixedExpenses;
            this.totalVariableExpenses = totalVariableExpenses;
            this.totalOneTimeExpenses = totalOneTimeExpenses;
            this.netMonthlyCashFlow = netMonthlyCashFlow;
        }
    }

    @AuraEnabled(cacheable=true)
    public static BudgetData getBudgetData(Id userId) {
        // Fetch Income Sources
        List<Income_Source__c> incomes = [
            SELECT Income_Amount__c, Income_Frequency__c 
            FROM Income_Source__c 
            WHERE User__c = :userId  
        ];

        // Fetch Recurring Expenses
        List<Recurring_Expense__c> recurringExpenses = [
            SELECT Expense_Amount__c, Expense_Frequency__c, Expense_Type__c, Expense_Date__c 
            FROM Recurring_Expense__c 
            WHERE User__c = :userId  
        ];

        // Perform Calculations
        Decimal totalMonthlyIncome = 0;
        Decimal totalFixedExpenses = 0;
        Decimal totalVariableExpenses = 0;
        Decimal totalOneTimeExpenses = 0;

        // Calculate Monthly Income
        for (Income_Source__c income : incomes) {
            totalMonthlyIncome += calculateMonthlyAmount(income.Income_Amount__c, income.Income_Frequency__c);
        }

        // Calculate Recurring Expenses
        for (Recurring_Expense__c expense : recurringExpenses) {
            Decimal monthlyAmount = calculateMonthlyAmount(expense.Expense_Amount__c, expense.Expense_Frequency__c);

            if (expense.Expense_Type__c == 'Fixed') {
                totalFixedExpenses += monthlyAmount;
            } else if (expense.Expense_Type__c == 'Variable') {
                totalVariableExpenses += monthlyAmount;
            } else if (expense.Expense_Type__c == 'One-Time' && isCurrentMonth(expense.Expense_Date__c)) {
                totalOneTimeExpenses += expense.Expense_Amount__c;
            }
        }

        // Calculate Net Monthly Cash Flow
        Decimal netMonthlyCashFlow = totalMonthlyIncome - (totalFixedExpenses + totalVariableExpenses + totalOneTimeExpenses);

        return new BudgetData(totalMonthlyIncome, totalFixedExpenses, totalVariableExpenses, totalOneTimeExpenses, netMonthlyCashFlow);
    }

    // Helper methods to calculate monthly amounts and check the current month
    private static Decimal calculateMonthlyAmount(Decimal amount, String frequency) {
        if (frequency == 'Monthly') {
            return amount;
        } else if (frequency == 'Quarterly') {
            return amount / 3;
        } else if (frequency == 'Bi annually') {
            return amount / 6;
        } else if (frequency == 'Yearly') {
            return amount / 12;
        } else if (frequency == 'One-Time') {
            return 0; // One-Time expenses are not spread across months
        } else {
            return 0;
        }
    }

    private static Boolean isCurrentMonth(Date expenseDate) {
        return expenseDate != null && expenseDate.month() == Date.today().month() && expenseDate.year() == Date.today().year();
    }
    
        @AuraEnabled
        public static void createIncomeSource(Decimal incomeAmount, String incomeFrequency, Id userId) {
            Income_Source__c incomeSource = new Income_Source__c();
            incomeSource.Income_Amount__c = incomeAmount;
            incomeSource.Income_Frequency__c = incomeFrequency;
            incomeSource.User__c = userId;
            insert incomeSource;
        }
    
        @AuraEnabled
        public static void createRecurringExpense(Decimal expenseAmount, String expenseFrequency, String expenseType, Date expenseDate, Id userId) {
            Recurring_Expense__c recurringExpense = new Recurring_Expense__c();
            recurringExpense.Expense_Amount__c = expenseAmount;
            recurringExpense.Expense_Frequency__c = expenseFrequency;
            recurringExpense.Expense_Type__c = expenseType;
            recurringExpense.Expense_Date__c = expenseDate;
            recurringExpense.User__c = userId;
            insert recurringExpense;
        }
    }
    
    

