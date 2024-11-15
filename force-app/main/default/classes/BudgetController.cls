public with sharing class BudgetController {
    

    // Wrapper class to return budget data
    public class BudgetData {
        @AuraEnabled public Decimal totalMonthlyIncome;
        @AuraEnabled public Decimal totalFixedExpenses;
        @AuraEnabled public Decimal totalVariableExpenses;
        @AuraEnabled public Decimal totalOneTimeExpenses;
        @AuraEnabled public Decimal netMonthlyCashFlow;
        @AuraEnabled public Decimal totalMonthlyContributions;
        @AuraEnabled public Decimal totalSavingsBalance;
        @AuraEnabled public Decimal totalCheckingBalance;
        @AuraEnabled public Decimal total401KBalance;

        public BudgetData(Decimal totalMonthlyIncome, Decimal totalFixedExpenses, Decimal totalVariableExpenses, Decimal totalOneTimeExpenses, Decimal netMonthlyCashFlow, Decimal totalMonthlyContributions, Decimal totalCheckingBalance, Decimal totalSavingsBalance, Decimal total401KBalance) {
            this.totalMonthlyIncome = totalMonthlyIncome;
            this.totalFixedExpenses = totalFixedExpenses;
            this.totalVariableExpenses = totalVariableExpenses;
            this.totalOneTimeExpenses = totalOneTimeExpenses;
            this.netMonthlyCashFlow = netMonthlyCashFlow;
            this.totalMonthlyContributions = totalMonthlyContributions;
            this.totalSavingsBalance = totalSavingsBalance;
            this.totalCheckingBalance = totalCheckingBalance;
            this.total401KBalance = total401KBalance;
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
        List<Savings_Checking_Account__c> savingExpenses = [
            SELECT Monthly_Contribution__c, Balance__c, Account_Type__c 
            FROM Savings_Checking_Account__c 
            WHERE User__c = :userId  
        ];

        // Perform Calculations
        Decimal totalMonthlyIncome = 0;
        Decimal totalFixedExpenses = 0;
        Decimal totalVariableExpenses = 0;
        Decimal totalOneTimeExpenses = 0;
        Decimal totalMonthlyContributions = 0;
        Decimal totalSavingsBalance = 0;
        Decimal totalCheckingBalance = 0;
        Decimal total401KBalance = 0;

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
        for (Savings_Checking_Account__c savings : savingExpenses) {
            totalMonthlyContributions += savings.Monthly_Contribution__c;
            if (savings.Account_Type__c == 'Savings') {
                totalSavingsBalance += savings.Balance__c;
            } else if (savings.Account_Type__c == 'Checking') {
                totalCheckingBalance += savings.Balance__c;
            }  else if (savings.Account_Type__c == '401K') {
                total401KBalance += savings.Balance__c;// create 401K balance
            }
        }

        totalMonthlyIncome -= totalMonthlyContributions;


        // Calculate Net Monthly Cash Flow
        Decimal netMonthlyCashFlow = totalMonthlyIncome - (totalFixedExpenses + totalVariableExpenses + totalOneTimeExpenses);

        return new BudgetData(totalMonthlyIncome, totalFixedExpenses, totalVariableExpenses, totalOneTimeExpenses, netMonthlyCashFlow, totalMonthlyContributions, totalCheckingBalance, totalSavingsBalance, total401KBalance);
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
    @AuraEnabled(cacheable=true)
    public static List<Monthly_Record__c> getMonthlyRecords(Integer year) {
        return [
            SELECT Id, Name, Income__c, Fixed_Expenses__c, Variable_Expenses__c, 
                   One_Time_Expenses__c, Net_Cash_Flow__c, Month__c, Year__c 
            FROM Monthly_Record__c 
            WHERE Year__c = :year
            ORDER BY Month__c
        ];
    }

    @AuraEnabled
    public static void createOrUpdateMonthlyRecords(Integer year, Decimal income, Decimal fixedExpenses, Decimal variableExpenses, Decimal oneTimeExpenses, Decimal netCashFlow) {
        // Check if records for the current year already exist
        List<Monthly_Record__c> existingRecords = [
            SELECT Id FROM Monthly_Record__c WHERE Year__c = :year
        ];

        // If records exist, do not create duplicates
        if (!existingRecords.isEmpty()) {
            return;
        }

        // List to hold the new records
        List<Monthly_Record__c> records = new List<Monthly_Record__c>();
        List<String> months = new List<String>{'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'};

        // Loop through each month and create records
        for (Integer i = 0; i < months.size(); i++) {
            Monthly_Record__c record = new Monthly_Record__c();
            record.Name = months[i] + ' ' + year;
            record.Month__c = months[i];
            record.Year__c = year;

            // Populate January with myFinances data
            if (i == 0) {
                record.Income__c = income;
                record.Fixed_Expenses__c = fixedExpenses;
                record.Variable_Expenses__c = variableExpenses;
                record.One_Time_Expenses__c = oneTimeExpenses;
                // record.Net_Cash_Flow__c = income - (fixedExpenses + variableExpenses + oneTimeExpenses);
            } else {
                // Other months should have the same data as January except for Variable and One-Time Expenses
                record.Income__c = income;
                record.Fixed_Expenses__c = fixedExpenses;
                record.Variable_Expenses__c = 0;
                record.One_Time_Expenses__c = 0;
                // record.Net_Cash_Flow__c = income - fixedExpenses;
            }

            records.add(record);
        }

        // Insert all new records
        insert records;
    }

    @AuraEnabled
    public static void updateMonthlyRecord(Monthly_Record__c record) {
        try {
            update record;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating record: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static List<sObject> getRecords(String objectApiName){
        String query;
        if (objectApiName == 'Income_Source__c') {
            query = 'SELECT Income_Name__c, Income_Amount__c, Income_Frequency__c, Income_Type__c FROM ' + objectApiName;
        }
        else if (objectApiName == 'Recurring_Expense__c') {
            query = 'SELECT Expense_Name__c, Expense_Amount__c, Expense_Frequency__c, Expense_Type__c FROM ' + objectApiName;
        } else if (objectApiName == 'Savings_Checking_Account__c') {
            query = 'SELECT Account_Name__c, Balance__c, Account_Type__c,Monthly_Contribution__c, Interest_Rate__c FROM ' + objectApiName;
        }
        


       
       return Database.query(query);
    }
    }